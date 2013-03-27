Flexbox.models.flexGrow = function (flewGrow, properties) {
	// Check for space, otherwise exit
	var values = this.values,
		container = values.container,

		crossStart = this.crossStart,
		mainStart = this.mainStart,

		mainSize = this.mainSize,
		crossSize = this.crossSize,

		containerMainSize = container[mainSize],
		containerCrossSize = container[crossSize],
		lines = this.lines;

	var utils = Flexbox.utils,
		colArray = ["column", "column-reverse"],
		revArray = ["row-reverse", "column-reverse"],
		flexDirection = properties["flex-direction"],
		isColumn = utils.assert(flexDirection, colArray),
		isReverse = utils.assert(flexDirection, revArray);

	var i, ilim, j, jlim, line, noOfItems, usedSpace,
		availSpace, flexTotal, curr, minMaxSize, runningDiff,
		dir, minMaxChange, freezeList, flexBasis, flexGS, flexGSdir,
		minOrMax, weights, sizeStore;

	for (i = 0, ilim = lines.length; i < ilim; i++) {
		line = lines[i];
		noOfItems = line.items.length;
		freezeList = new Array(noOfItems);
		flexBasis = new Array(noOfItems);
		weights = new Array(noOfItems);

		// TODO Properly: calculate hypothetical main and cross size of each item
		// Currently just use width/height + margin + padding + border

		usedSpace = 0;
		for (j = 0; j < noOfItems; j++) {
		    if (typeof line.items[j].debug.properties["flex-basis"] === "undefined" || line.items[j].debug.properties["flex-basis"] === "auto") {
			    flexBasis[j] = line.items[j][mainSize];
		    } else {
		    	// TODO support anything other than px
		        flexBasis[j] = line.items[j].debug.properties["flex-basis"].slice(0,-2) << 0;
			}
			usedSpace += flexBasis[j] + line.items[j].debug.padding[mainStart + "Total"] + line.items[j].debug.border[mainStart + "Total"] + line.items[j].debug.margin[mainStart + "Total"];
		}

		// TODO Properly: Determine the available main and cross space for the flex items (9.2)
		// Currently just using containerMainSize

		availSpace = containerMainSize - usedSpace;

        // Are we growing or shrinking?
		flexGS = (availSpace < 0 ? "flex-shrink" : "flex-grow");
		minOrMax = (availSpace < 0 ? "min-" : "max-");
		flexGSdir = (availSpace < 0 ? -1 : 1);

		if(availSpace < 0){
			// TODO: stop flew-shrink acting when a explicit height/width is given
			// Currently: doesn't do anything with flex-shrink
			continue;
		}

		flexTotal = 0;
		for (j = 0; j < noOfItems; j++) {
		    if(flexGSdir == 1){
		        // flex-grow
		        weights[j] = line.items[j].debug.properties["flex-grow"] << 0;
		    } else {
		        // flex-shrink (based on size*flex-shrink"
		        if(isNaN(line.items[j].debug.properties["flex-shrink"])) line.items[j].debug.properties["flex-shrink"] = 1;
		        weights[j] = flexBasis[j]*line.items[j].debug.properties["flex-shrink"];
		    }
			flexTotal += weights[j];
		}

		if (flexTotal == 0) {
			// Nothing can change on this line - do nothing!
			continue;
		}

		// Max-width/height support (for flex-[grow/shrink], [min/max] support is handled by the browser!)
		// This could be made faster/prettier, but currently it's more debug-able in this form
		minMaxChange = 1;
        while(minMaxChange){
            minMaxChange = 0;
            for (j = 0; j < noOfItems; j++) {
	            curr = (availSpace * weights[j]) / flexTotal;
	            minMaxSize = line.items[j].debug.properties[minOrMax+mainSize];
	            if ( isNaN(freezeList[j]) && ( flexBasis[j] + curr < 0 || ( typeof minMaxSize !== "undefined" && (flexGSdir * (line.items[j][mainSize] + curr) > flexGSdir * minMaxSize)))) {
		            minMaxChange = 1;
		            // use freezeList to store the amount we have to change that element by
		            freezeList[j] = (flexBasis[j] + curr < 0 ? -flexBasis[j] : minMaxSize - flexBasis[j]);
		            flexTotal -= weights[j];
		            availSpace -= freezeList[j];
		            // This stops a divide by zero later whilst allowing the re-flow of max-width/height items
		            if(flexTotal == 0) flexTotal = 1;
	            }
            }
        }

        // Now check everything grows/shrinks (can't mix and match)
		minMaxChange = 1;
        while(minMaxChange){
            minMaxChange = 0;
            for(j = 0; j < noOfItems; j++){
		    	curr = (availSpace * weights[j]) / flexTotal;
	            if ( isNaN(freezeList[j]) && ( flexGSdir * (flexBasis[j] + curr) < flexGSdir * line.items[j][mainSize])) {
		        	minMaxChange = 1;
		            // use freezeList to store the amount we have to change that element by
		            freezeList[j] = line.items[j][mainSize]-flexBasis[j];
		            flexTotal -= weights[j];
		            availSpace -= freezeList[j];
		            // This stops a divide by zero later whilst allowing the re-flow of max-width/height items
		            if(flexTotal == 0) flexTotal = 1;
	            }
	        }
        }

		runningDiff = 0;
		dir = (isReverse ?  -1 : 1);
		for (j = 0; j < noOfItems; j++) {
		    // addition for flex-grow, subtraction for flex-shrink
			curr = ( !isNaN(freezeList[j]) ? freezeList[j] : availSpace * weights[j] / flexTotal );
			sizeStore = line.items[j][mainSize];
			line.items[j][mainSize] = flexBasis[j] + curr;
			line.items[j][mainStart] += (isReverse ?  -runningDiff - line.items[j][mainSize] + sizeStore : runningDiff);
			// For Debug uncomment next line
			//console.log("Item ", j, "'s ", mainStart, " was moved by ", (isReverse ?  -runningDiff - curr : runningDiff), " and inc ", mainSize ," by ", curr);
			runningDiff += line.items[j][mainSize] - sizeStore;
		}
	}

};