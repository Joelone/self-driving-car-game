
var NeuralNetworkTrainer = require('./neuralnetworktrainer')
// game settings

const GAMES = 20
const GAME_SIZE = 100
const GAME_UNIT = 5
const FRAME_RATE = 45

// game bottlenecks

const LOWEST_SCORE_ALLOWED = 0

// neural network settings

const MUTATION_RATE = 0.5
const MUTATION_AMOUNT = 3
const ELITISM = Math.round(0.2 * GAMES)


const Neat = neataptic.Neat;
const Config = neataptic.Config;

Config.warnings = false;

const neat = new Neat(17, 4, null, {
        popsize: GAMES,
        elitism: ELITISM,
        mutationRate: MUTATION_RATE,
        mutationAmount: MUTATION_AMOUNT
    }
);


let highestScore = 0

const runner = new NeuralNetworkTrainer({
    neat,
    games: GAMES,
    gameSize: GAME_SIZE,
    gameUnit:  GAME_UNIT,
    frameRate: FRAME_RATE,
    lowestScoreAllowed: LOWEST_SCORE_ALLOWED,
    onEndGeneration: ({generation, max}) => {

        if (max > highestScore) {
            highestScore = max
        }

        document.getElementById('generation').innerHTML = generation
        document.getElementById('highest-score').innerHTML = highestScore
    }
})

runner.startGeneration()

window.saveNetwork = () => {
    document.getElementById('pastebin').value = JSON.stringify(runner.neat.export());
};
window.loadNetwork = () => {
    runner.neat.import(JSON.parse(document.getElementById('pastebin').value));
};