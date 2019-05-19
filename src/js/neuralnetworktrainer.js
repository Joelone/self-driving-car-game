var Game = require('./game');


class NeuralNetworkTrainer{

    constructor ({neat, games, gameSize, gameUnit, frameRate, lowestScoreAllowed, onEndGeneration}) {
        this.neat = neat
        this.games = []
        this.numGames = games;
        this.gamesFinished = 0
        this.onEndGeneration = onEndGeneration;

    }

    startGeneration () {
        this.gamesFinished = 0

        for (let i = 0; i < this.numGames; i++) {
            var brain = this.neat.population[i];
            this.games[i] = new Game(1600, 900, () => this.endGeneration(), brain, 30, true);
        }
    }

    endGeneration () {
        if (this.gamesFinished + 1 < this.games.length) {
            this.gamesFinished++
            return
        }

        this.neat.sort()

        this.onEndGeneration({
            generation: this.neat.generation,
            max: this.neat.getFittest().score
        })

        const newGeneration = []

        for (let i = 0; i < this.neat.elitism; i++) {
            newGeneration.push(this.neat.population[i])
        }

        for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
            newGeneration.push(this.neat.getOffspring())
        }

        this.neat.population = newGeneration
        this.neat.mutate()
        this.neat.generation++
        this.startGeneration()
    }

}

module.exports = NeuralNetworkTrainer;