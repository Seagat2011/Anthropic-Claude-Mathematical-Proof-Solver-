

function applyRule (guidZ, expression, tmpAxioms, action) {
    const axiomIDS = (() => {
        let tmpA = [];
        switch (action) {
            case 'reduce':
                if (tmpAxioms [guidZ]?._lhsReduce) {
                    tmpA.push (
                        ...tmpAxioms [guidZ]?._lhsReduce
                    );
                }
                if (tmpAxioms [guidZ]?._rhsReduce) {
                    tmpA.push (
                        ...tmpAxioms [guidZ]?._rhsReduce
                    );
                }
                break;
            case 'expand':
                if (tmpAxioms [guidZ]?._lhsExpand) {
                    tmpA.push (
                        ...tmpAxioms [guidZ]?._lhsExpand
                    );
                }
                if (tmpAxioms [guidZ]?._rhsExpand) {
                    tmpA.push (
                        ...tmpAxioms [guidZ]?._rhsExpand
                    );
                }
                break;
        } // end switch (action)
        return tmpA;
    }) ();
    let batchRewrites = [];
    const I = axiomIDS.length;
    for (let i = 0; i < I; i++) {
        const uuid = axiomIDS [i];
        if (uuid == guidZ)
            continue;
        const axiom = tmpAxioms [uuid];
        const [left, right] = axiom.subnets;
        const from = action === 'reduce' ? left : right;
        const to = action === 'reduce' ? right : left;
        const rewriteFound = expression._tryReplace (from, to);
        if (rewriteFound) {
            batchRewrites.push( {
                result: rewriteFound,
                axiomID: axiom.axiomID,
                axiomRewriteID: uuid,
            });
        }
    } // end for (let i = 0; i < I; i++)
    return batchRewrites;
} // end applyRule

/*
        !proofFound
            && (result = proofsteps
                .sort((a,b) => b.length > a.length)
                    .shift());

        return `${proofFound ? 'Proof' : 'Partial-proof'} found!\n\n${proofStatement.subnets [0].join (' ')} = ${proofStatement.subnets [1].join (' ')}, (root)\n`
            + steps
                .map ((step, i) => {
                    // update proofstep
                    const { side, result, action, axiomID } = step;
                    const isLHS = side === 'lhs';
                    const currentSide = isLHS ? result : lhs;
                    const otherSide = isLHS ? rhs : result;

                    // update global expression
                    if (isLHS) {
                        lhs = result;
                    } else {
                        rhs = result;
                    }

                    // return rewrite string
                    return `${currentSide.join (' ')} = ${otherSide.join (' ')}, (${side} ${action}) via ${axiomID}`;
                })
                .join ('\n')
                    + (proofFound ? '\n\nQ.E.D.' : '');
        */
                    function _applyAxioms (tmpAxioms, guidZ, sides, action) {
                        sides = sides.map ((current,idx,me) => {
                            let lastGUIDZ = guidZ;
                            let changed;
                            const side = idx == 0 ? 'lhs' : 'rhs' ;
                            do {
                                changed = applyRule (lastGUIDZ, current, tmpAxioms, action);
                                for (let ch of changed) {
                                    steps.push ({ side, action, result: [...ch.result], axiomID: ch.axiomID, other: [] });
                                    current = ch.result;
                                    lastGUIDZ = ch.axiomRewriteID;
                                }
                            } while (changed?.length > 0);
                            return current;
                        });
                        return (sides [0].join (' ') == sides [1].join (' '));
                    } // end applyAxioms
            
                    function applyAxioms (tmpAxioms, guidZ, sides, action) {
                        /*
                        sides = sides.map ((current,idx,me) => {
                            let lastGUIDZ = guidZ;
                            let changed;
                            const side = idx == 0 ? 'lhs' : 'rhs' ;
                            do {
                                changed = applyRule (lastGUIDZ, current, tmpAxioms, action);
                                for (let ch of changed) {
                                    steps.push ({ side, action, result: [...ch.result], axiomID: ch.axiomID, other: [] });
                                    current = ch.result;
                                    lastGUIDZ = ch.axiomRewriteID;
                                }
                            } while (changed?.length > 0);
                            return current;
                        });
                        return (sides [0].join (' ') == sides [1].join (' '));
                        */
                    } // end applyAxioms

/*
            if (lhs.join (' ') == rhs.join (' '))
                return true;
            let ret = applyAxioms (axioms, proofStatement.guidZ, [[...lhs], [...rhs]],'reduce');
            ret == (lhs.join (' ') == rhs.join (' '));
            // reduce failed? Try expand!
            !ret
                && (proofsteps.push ([...steps]))
                    && (steps = [])
                        && (ret = applyAxioms (axioms, proofStatement.guidZ, [[...lhs], [...rhs]], 'expand'));
            proofsteps.push ([...steps]);
            return ret;
            */

    /**************************************************
     * Term-Rewriting System with Generator Function
     **************************************************/
    function* rewriteGenerator(theorem, theorem_to_prove, axioms) {
        // Track strings that we have seen already
        const visited = new Set();
        // Initialize our queue with the starting theorem
        const queue = [theorem];

        // Mark the starting theorem as visited
        visited.add(theorem);

        while (queue.length > 0) {
            // Take the next item from the queue
            const current = queue.shift();

            // Yield the current rewrite step
            yield current;

            // Check if we have reached our desired theorem
            if (current == theorem_to_prove) {
                // Stop the generator once the target is found
                return;
            }

            // Attempt all possible rewrites by applying every axiom
            for (const axiom of axioms) {
                for (const from in axiom) {
                    const to = axiom[from];

                    // Identify the placeholder pattern in the theorem text, e.g. {a} -> {b}
                    const matchPattern = `{${from}}`;
                    const rewritePattern = `{${to}}`;

                    // For each place that "from" occurs, replace and produce a new candidate
                    let startIndex = 0;
                    while (true) {
                        const idx = current.indexOf(matchPattern, startIndex);
                        if (idx === -1) {
                            break;
                        }
                        // Construct the new theorem string after rewriting
                        const newTheorem =
                            current.slice(0, idx)
                                + rewritePattern
                                    + current.slice(idx + matchPattern.length);

                        // If we have not seen this new rewrite, enqueue it for further exploration
                        if (!visited.has(newTheorem)) {
                            visited.add(newTheorem);
                            queue.push(newTheorem);
                        }

                        // Move past this occurrence to look for another
                        startIndex = idx + matchPattern.length;
                    }
                }
            }
        }
    } // rewriteGenerator(theorem, theorem_to_prove, axioms)

    /*

    // Example usage:

    // Define your axioms: each object means '{key}' -> '{value}'
    const axioms = [
        { 'a': 'b' },
        { '0': '1' },
        { 'y': 'z' }
    ];

    // Starting theorem
    const theorem = '{a} + {0} + {y}';
    // Target theorem we wish to prove
    const theorem_to_prove = '{b} + {1} + {z}';

    // Instantiate the generator
    const generator = rewriteGenerator(theorem, theorem_to_prove, axioms);

    // Collect the steps in an array for inspection
    const proofSteps = [];
    for (const step of generator) {
        console.log('Rewrite step:', step);
        proofSteps.push(step);

        if (step === theorem_to_prove) {
            break;
        }
    }

    console.log(proofSteps,'\n\n');

    if(proofSteps[proofSteps.length-1] == theorem_to_prove) {
        console.log('Q.E.D.');
    } else if (proofSteps.length > 0) {
        console.log('Partial-proof found.');
    } else {
        // If we never encountered the theorem_to_prove, no successful proof was found
        console.log('No proof found.');
    }

    */

class currentCommitCl {
    constructor(
      axiomIDW = '',
      flagPropertyNameW = '',   // e.g. 'alreadyReducedFlag' or 'alreadyExpandedFlag'
      flagValueBool = false,
      commitHistoryarray = []
    ) {
      // Create a sub-object that looks like: [axiomID]: { [flagPropertyName]: flagValue }
      this[axiomIDW] = {
        [flagPropertyNameW]: flagValueBool
      };

      // Attach commitHistory array
      this.commitHistoryarray = commitHistoryarray;
    }
}

    /**
     * example
     * '{ { { { a } + { b } + { c } }'
     *      .match(/\S+/g)
     *          .simplifyBraces ();
     * 
     * output
     *  [ "{", "a", "+", "b", "+", "c", "}" ]
     */
    Object.prototype.simplifyBraces = function() {
        let result = this;
        let lbrace = [];
        let rbrace = [];
        let pair = [];
        let deleteZ = new Map();
        const I = result.length;
        const lastIDXZ = I-1;
    
        // First pass: mark braces to remove
        for (let i = 0; i < I; i++) {
            if (result[i] === '{') {
                lbrace.push(i);
            } else if (result[i] === '}') {                
                rbrace.push(i);
            }
            if (lbrace.length > 0 && rbrace.length > 0) 
                pair.push(lbrace.pop(), rbrace.pop());
            if (pair.length > 1){
                const scopeExists = 
                    ((pair[1] - pair[0]) > 2) 
                        && !((pair [0] == 0) && (pair[1] == lastIDXZ));
                if (!scopeExists){
                    deleteZ.set (pair[0], true);
                    deleteZ.set (pair[1], true);
                }
                pair = [];
            }
            if (i == lastIDXZ) {
                // Mark any unmatched opening braces for deletion
                lbrace.forEach(index => deleteZ.set(index, true));      
        
                // Mark any unmatched closing braces for deletion
                rbrace.forEach(index => deleteZ.set(index, true));
            }
        } 

        // Second pass: remove marked braces and any trailing unclosed braces
        return result.filter((tok, i) => !deleteZ.has(i));
    } // end simplifyBraces
