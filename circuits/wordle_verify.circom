pragma circom 2.1.4;

include "circomlib/poseidon.circom";
include "circomlib/comparators.circom";

template WordleVerify() {
    // Public inputs
    signal input gameId;
    signal input player;
    signal input claimedScore;
    signal input answerCommitment;
    
    // Private inputs
    signal input answer[5];        // The actual answer word (as ascii values)
    signal input salt;            // Salt used in answer commitment
    signal input guesses[6][5];   // Up to 6 guesses, each 5 letters
    signal input numGuesses;      // Number of guesses used
    
    // 1. Verify answer commitment
    component poseidon = Poseidon(6);
    poseidon.inputs[0] <== answer[0];
    poseidon.inputs[1] <== answer[1];
    poseidon.inputs[2] <== answer[2];
    poseidon.inputs[3] <== answer[3];
    poseidon.inputs[4] <== answer[4];
    poseidon.inputs[5] <== salt;
    
    answerCommitment === poseidon.out;
    
    // 2. Verify each guess is valid (simplified)
    // In practice you'd need a more complex validation that each guess
    // is in the allowed word list
    
    // 3. Calculate score based on matches
    var totalScore = 0;
    component letterChecks[6][5];
    
    for (var i = 0; i < 6; i++) {
        if (i < numGuesses) {
            var exactMatches = 0;
            // Check exact matches
            for (var j = 0; j < 5; j++) {
                letterChecks[i][j] = IsEqual();
                letterChecks[i][j].in[0] <== guesses[i][j];
                letterChecks[i][j].in[1] <== answer[j];
                exactMatches += letterChecks[i][j].out;
            }
            
            // If all letters match, we found the answer
            if (exactMatches == 5) {
                totalScore = calculateScore(i + 1);
            }
        }
    }
    
    // 4. Verify claimed score matches calculated score
    claimedScore === totalScore;
} 