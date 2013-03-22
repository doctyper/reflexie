# ALLPAIRS, by James Bach, www.satisfice.com
# Version 1.21
# Copyright (C) 2002, James Bach (james@satisfice.com)

# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.

# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.

#
# This program attempts to find the smallest number of test cases that
# include all pairings of each variable with each other variable.
#
# All permutations of each variable is easy, all pairs is much harder.
# The way this program works is that it makes a checklist of every pair of
# variables, and checks each pair off as it packs it into a test case.
# The program tries to pack as many un-checked-off pairs into each test case
# as possible. It's kind of like packing boxes: if you're smart you can find
# a combination of object for each box that will result in the minimum of wasted
# space. This program is not smart. It just packs the pairs into the test cases
# until every pair has been packed. It does not result in the smallest number
# of cases that could account for all the pairs, but the set will not be too large.
#
# All permutations of 10 variables of 10 values each results in 10 billion
# test cases. This program packs all pairs into a mere 177 cases. It's not
# optimal, but it's not bad, either.
#
# v1.01: Now compiles clean with strict and warnings turned on; added "don't care" tildes
# v1.1 : Status table now prints which cases go with with pairings.
# v1.2 : Now prints test case variables in the order provided.
#      : Improved error handling for bad tables.
#      : Added more usage information.
#      : Used "our" keyword instead of annoying package qualifiers.
# v1.21: Fixed an outrageous bug with the column order.
#
# TODO: 
#	- read REQUIRED table
#	- use slugs from REQUIRED table before doing the rest.
#	- implement PROHIBITED table

use strict;

my $usage = <<EOS;
Allpairs prepares test cases to cover all pairings of a set of variables.

EXE usage:    allpairs datafile
Script usage: perl allpairs.pl datafile

"datafile" is a tab delimited text file that consists of labelled columns
of variables. The first row of the table is treated as labels.
If you copy from Excel into a text file it will be the right format.

Example: allpairs test.txt

...where test.txt contains:

colors	cars	times
purple	Mazda	night
blue	Ford	day
silver		dawn

...will produce this output:


TEST CASES
case	colors	cars	times	pairings
1	purple	Mazda	night	3
2	purple	Ford	day	3
3	blue	Ford	night	3
4	blue	Mazda	day	3
5	silver	Mazda	dawn	3
6	silver	Ford	night	2
7	purple	Ford	dawn	2
8	blue	~Mazda	dawn	1
9	silver	~Mazda	day	1

PAIRING DETAILS
var1	var2	value1	value2	appearances	cases
colors	times	purple	night	1	1
colors	times	purple	day	1	2
colors	times	purple	dawn	1	7
colors	times	blue	night	1	3
colors	times	blue	day	1	4
colors	times	blue	dawn	1	8
colors	times	silver	night	1	6
colors	times	silver	day	1	9
colors	times	silver	dawn	1	5
colors	cars	purple	Mazda	1	1
colors	cars	purple	Ford	2	2, 7
colors	cars	blue	Mazda	2	4, 8
colors	cars	blue	Ford	1	3
colors	cars	silver	Mazda	2	5, 9
colors	cars	silver	Ford	1	6
times	cars	night	Mazda	1	1
times	cars	night	Ford	2	3, 6
times	cars	day	Mazda	2	4, 9
times	cars	day	Ford	1	2
times	cars	dawn	Mazda	2	5, 8
times	cars	dawn	Ford	1	7

EOS

our @neededvalues = ();
our @vars = ();
our %labels = ();
our @labels = ();
our %lists = ();
our %listorder = ();
our @listorder = ();
our %pairs = ();
our %pairscases = ();
our @zeroes = ("","0","00","000");
our $slug = "";

my $count = 1;
my $file = shift @ARGV || die $usage;
maketables($file, "tables"); # read the datafile and fill the arrays with each variable.

populate(); # make the checklists for the pairs.

# This loop creates the "slug" which is the blank test case filled in by the recursive FINDNEXT routine.
#
for (my $c=0;$c<scalar(@vars);$c++)
{
	$slug .= "x\t";
}
chop $slug;

# print first line of the output table.
#
print "TEST CASES\n";
print "case\t";
@labels = gettable("tables","labels");
foreach (sort byoriginal @labels)
{
	print "$_\t";
}
print "pairings\n";

# find each test case, then show the status of all the pairings
#
while(more())
{
	@neededvalues = ();
	my $case = findnext($slug);

	print $count."\t".readable($case).score($case)."\n";
	checkin($case, $count++);
}
status();


####################
# END OF MAIN CODE #
####################

# This routine counts the unique pairings in a test case.
#
sub score
{
	my $score = 0;
	my $case = $_[0];
	my @casevalues = split /\t/, $case;
	my ($c, $v) = 0;
	for ($c=0;$c<scalar(@vars)-1;$c++)
	{
		for ($v=$c+1;$v<scalar(@vars);$v++)
		{
			$score++ if (${$pairs{"$c-$v"}}{$casevalues[$c]."-".$casevalues[$v]} == 0);
		}
	}
	return $score;
}

# This routine records all the new pairings in a test case in the checklists.
#
sub checkin
{
	my ($c, $v) = 0;
	my $case = $_[0];
	my $casenumber = $_[1];
	my @casevalues = split /\t/, $case;
	for ($c=0;$c<scalar(@vars)-1;$c++)
	{
		for ($v=$c+1;$v<scalar(@vars);$v++)
		{
			${$pairs{"$c-$v"}}{$casevalues[$c]."-".$casevalues[$v]}++;
			push @{${$pairscases{"$c-$v"}}{$casevalues[$c]."-".$casevalues[$v]}}, $casenumber;
		}
	}

}

# This routine creates the checklists of pairs.
#
sub populate
{
	my ($c, $v, $x, $y) = 0;
	for ($c=0;$c<scalar(@vars)-1;$c++)
	{
		for ($v=$c+1;$v<scalar(@vars);$v++)
		{
			for ($x=0;$x<$vars[$c];$x++)
			{
				for ($y=0;$y<$vars[$v];$y++)
				{
					${$pairs{"$c-$v"}}{$x."-".$y} = 0;
				}
			}
		}
	}
}

# This recursive routine walks through all the values of all the variables, trying to construct
# a test case with the highest number of unique pairings.
#
sub findnext
{
	my ($c, $v, $x, $y) = 0;
	my $case = shift;
	my @casevalues = split /\t/, $case;
	my @scores = ();
	my @scorestrings = ();
	my $best = "x";

	# find the unfinished part of the test case.
	for ($c=0;$c<scalar(@vars);$c++)
	{
		last if ($casevalues[$c] eq "x");
	}

	# but if no part is unfinished, then we're done.
	return $case if ($c == scalar(@vars));

	# let's walk through the values for the particular variable we have to choose.
	for ($x=0;$x<$vars[$c];$x++)
	{
		@scores = ();

		# let's check the current variable paired against the all the other values.
		for ($v=0;$v<scalar(@vars);$v++)
		{
			# but don't check it against itself.
			if ($v == $c) {$scores[$v] = 0; next}

			# for any variable we've already chosen, we already know the pairing status
			# and we just add that to the score.
			if ($v < $c)
			{
				$scores[$v] = ${$pairs{"$v-$c"}}{$casevalues[$v]."-".$x};
			}

			# for the variables we haven't yet chosen, we walk through those values and see what the best pairing score will be. 
			else
			{
				$best = "x";
				for ($y=0;$y<$vars[$v];$y++)
				{
					$best = ${$pairs{"$c-$v"}}{$x."-".$y} if ($best eq "x" || ${$pairs{"$c-$v"}}{$x."-".$y} < $best)
				}
				$scores[$v] = $best+0;
			} 
		}

		# now create a sorted string of scores for the value ($x) of current variable ($c) vs. values ($y) of each other variable ($v)
		#foreach (@scores) {print "value:$_\n"}
		foreach (sort @scores)
		{
			$scorestrings[$x] .= $zeroes[4-length($_)].$_."\t";
		}
		chop $scorestrings[$x];
		$scorestrings[$x] .= ":".$zeroes[4-length($x)].$x;
	}

	# the scores for each choice are now in a set of strings of the form {score}:{choice}.
	# the next step is to sort the scorestrings, pick the best, and record that choice...
	$casevalues[$c]  = (split /:/,(sort @scorestrings)[0])[1]+0;

	# this monstrousity of a line of code records whether the best choice is a needed value or not. If the best choice
	# results in no unique pairings, then we call it "N" meaning it's the best choice, but really doesn't matter.
	$neededvalues[$c] = ((sort(split /\t/,(split /:/,(sort @scorestrings)[0])[0]))[1] == 0) ? "Y" : "N";

	# now construct the test case string and call findnext again. 
	$case = "";
	foreach (@casevalues)
	{
		$case .= $_."\t";
	}
	chop $case;

	# after the recursion bottoms out, it will unwind via this return statement.
	return findnext($case);
}

# This routine displays the status of the pairing checklists.
#
sub status
{
	my ($c, $v, $x, $y) = 0;
	print "\nPAIRING DETAILS\n";
	print "var1\tvar2\tvalue1\tvalue2\tappearances\tcases\n";
	for ($c=0;$c<scalar(@vars)-1;$c++)
	{
		for ($v=$c+1;$v<scalar(@vars);$v++)
		{
			for ($x=0;$x<$vars[$c];$x++)
			{
				for ($y=0;$y<$vars[$v];$y++)
				{
					print $labels[$c]."\t".
					      $labels[$v]."\t".
					      (gettable("tables",$c))[$x]."\t".
					      (gettable("tables",$v))[$y]."\t".
					      ${$pairs{"$c-$v"}}{$x."-".$y}."\t";
					my $comma = "";
					foreach (@{$pairscases{"$c-$v"}{$x."-".$y}})
					{
						print $comma."$_";
						$comma = ", ";
					}
					print "\n";
				}
			}
		}
	}
}

# This routine returns true if there are any unpaired variables left to pack into a test case.
#
sub more
{
	my ($c, $v, $x, $y) = 0;
	for ($c=0;$c<scalar(@vars)-1;$c++)
	{
		for ($v=$c+1;$v<scalar(@vars);$v++)
		{
			for ($x=0;$x<$vars[$c];$x++)
			{
				for ($y=0;$y<$vars[$v];$y++)
				{
					if (${$pairs{"$c-$v"}}{$x."-".$y} == 0) {return 1};
				}
			}
		}
	}
	return 0;
}

# This routine turns a tab delimited table of variables into a set of hashes containing arrays.
#
sub maketables
{
	# populates array LABELS and hash LISTS indexed by table name. Multiple tables can be processed, that way.
	my ($file, $tablename) = @_;
	my $index = 0;
	my $count = 0;
	my $numoftabs = 0;

	open (DATA, $file) || die "Can't open $file";
	my @data = <DATA>;
	close DATA;
	
	my $label = shift @data;
	if ($label !~ /\t/) {die "Error: The first line of the file must be a tab-delimited list of labels with more than one label in it, and no blank labels.\n"}
	if ($label =~ /\t\t/) {die "Error: Missing column label or extraneous tabs in the first line of the file. The first line of the file must be a tab-delimited list of labels with more than one label in it, and no blank labels.\n"}
	foreach(split /\t/, $label)
	{
		chomp $_;
		if (exists($listorder{$_})) {die "Each column must have a unique label. Column \"$_\" is not unique.\n"}
		else 
		{
			$listorder{$_} = $count++;
		}
		push @{$labels{$tablename}}, $_;
	}
	
	foreach (@data)
	{
		$index = 0;
		$numoftabs = s/\t/\t/g;
		$numoftabs++;
		if ($numoftabs != $count){die "Error in the table. This row:\n\n$_\nhas $numoftabs columns instead of $count.\n\nThe data table should be tab delimited. Each row of the table must have the same number of columns as the first row (the label row). Check for extra tabs or spurious lines in the table.\n"}
		foreach(split /\t/)
		{
			chomp $_;
			if ($_ ne "") {push @{$lists{${$labels{$tablename}}[$index]}}, $_;}
			$index++;
		}
	}

	# reorder the variable lists by size, because the allpairs algorithm works better that way.
	@{$labels{$tablename}} = sort bysize @{$labels{$tablename}};
	$index = 0;
	foreach (@{$labels{$tablename}})
	{
		$listorder[$listorder{$_}] = $index++;
	}
	for ($index=0;$index<scalar(@{$labels{$tablename}});$index++)
	{
		$vars[$index] = scalar(@{$lists{${$labels{$tablename}}[$index]}});
	}
	print "\n";
		
}

# To make the code easier to work with, this routine extracts a list from the hash of lists.
# That way, we can do what we want to do by saying $mylist[0] instead of ${$lists{${$labels{$tablename}}[$index]}}[0]
#
sub gettable
{
	my ($tablename,$index) = @_;
	if ($index eq "labels")
	{ return @{$labels{$tablename}} }
	return @{$lists{${$labels{$tablename}}[$index]}};
}

# This routine translates the variable value indexes into their readable labels.
#
sub readable
{
	my $case = shift;
	my $newcase = "";
	my $t = 0;
	my @list = split /\t/, $case;
	for ($t=0;$t<scalar(@list);$t++)
	{
		if ($neededvalues[$listorder[$t]] eq "N") {$newcase .= "~"} # "~" is the don't care symbol.
		$newcase .= (gettable("tables",$listorder[$t]))[$list[$listorder[$t]]]."\t";
	}
	return $newcase;
}

# sort routine to order lists according the number of elements in the list.
#
sub bysize
{
	scalar(@{$lists{$b}}) <=> scalar(@{$lists{$a}});
}

# sort routine to order lists according the number of elements in the list.
#
sub byoriginal
{
	$listorder{$a} <=> $listorder{$b};
}
