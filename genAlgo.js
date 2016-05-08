/*


###########################################################################
|--------------------------------------------------------------------------

  Genetic algorithm Project

  1. Evolve generations of chromosones to produce the the goal text.
  2. Find optimum population size (brute force for now)

|--------------------------------------------------------------------------
###########################################################################


*/

class Chromosome {
    constructor (code = '') {
        this.code = code;
        this.cost = 9999;
    }

    // Create a random chromosone
    random (length) {
        while (length--) {
            this.code += String.fromCharCode(Math.floor(Math.random() * 255));
        }
    }

    // Find the difference between each character ASCII code, and square it to
    // get a positive number
    calcCost (compareTo) {
        let total = 0;
        for (let i = 0; i < this.code.length; i++) {
            total += Math.pow(this.code.charCodeAt(i) - compareTo.charCodeAt(i), 2);
        }

        return this.cost = total;
    }

    // Split the chromosone in half and gene-splice with another to create children
    breed (chromosome) {
        const pivot = Math.round(this.code.length / 2) - 1;

        const child1 = this.code.substr(0, pivot) + chromosome.code.substr(pivot);
        const child2 = chromosome.code.substr(0, pivot) + this.code.substr(pivot);

        return [new Chromosome(child1), new Chromosome(child2)];
    }

    // Randomly decide if chromosone should mutate
    // If yes, randomly add or subtract 1 from the randomly-selected character code (gene)
    mutate(chance = 0.5) {
        if (Math.random() > chance) return;

        const index = Math.floor(Math.random() * this.code.length);
        const upOrDown = Math.random() <= 0.5 ? -1 : 1;
        let newChar = String.fromCharCode(this.code.charCodeAt(index) + upOrDown);
        let newString = '';

        for (let i = 0; i < this.code.length; i++) {
            if (i === index) newString += newChar;
            else newString += this.code[i];
        }

        return this.code = newString;
    }
}

class Population {

    constructor (goal, size = 20, displayGenerations = true) {
        this.members = [];
        this.goal = goal;
        this.generationNumber = 0;
        this.notFound = true;
        this.originalSize = size;

        while (size--) {
            let chromosome = new Chromosome();
            chromosome.random(this.goal.length);
            this.members.push(chromosome);
        }
    }

    // Order the children by cost
    _sort (a, b) {
        return this.members.sort((a, b) => a.cost - b.cost);
    }

    // Display helper method
    Log (lastGen = false) {

        if (!this.displayGenerations) return;

        const count = lastGen ? this.generationNumber + 1 : this.generationNumber;
        let gen = `***** \nGeneration: ${count}`;

        this.members.forEach(member => gen += `\n${member.code} (${member.cost})`);

        console.log(gen);
    }

    generation () {
        // Calc the cost for the children
        this.members.forEach(member => member.calcCost(this.goal));

        this._sort();
        this.Log();

        // Now the children are ordered by cost, breed the first 2 (strongest)
        let [child1, child2] = this.members[0].breed(this.members[1]);

        // Remove the 2 of the weakest chromosones and insert the children
        this.members.splice(this.members.length - 2, 2, child1, child2);

        // Recalc the new children
        this.members.forEach(member => {
            member.mutate();
            member.calcCost(this.goal);
            if (member.code === this.goal) {
                this._sort();
                this.Log(true);
            }
        });

        return this.generationNumber++;
    }

    run () {

        const now = Date.now();

        while (this.notFound) {

            const isFound = this.members
                .map(member => member.code)
                .includes(this.goal);

            if (isFound) {
                this.notFound = false;

                console.log(`
                Successful child!
                Population Size: ${this.originalSize}
                Generation: ${this.generationNumber}
                Run Time: ${Date.now() - now}ms`
                );

                const obj = {
                    numGen: this.generationNumber,
                    size: this.originalSize,
                    time: Date.now() - now,
                };
                return obj;
            }

            // Run until a successful child is found
            this.generation();
        }
    }

}

class OptimumPopulationSize {

    constructor(maxGeneration = 20, repeatNumber = 10) {
        this.maxGeneration = maxGeneration;
        this.repeatNumber = repeatNumber;
        this.previousGen = [];
        this.fitness = 0;
        this.sameGenFor5 = false;
        this.generationNumber = 0;
    }

    // TODO rather than just brute forcing the optimum poulation size
    // Come up with fitness criteria (the lower the generation count and faster the speed, the better the fitness score)
    // Find a way to mutate the number and breed

    runPop() {

        const now = Date.now();

        const averageOverIterations = [];

        for (let i = 3; i < this.maxGeneration; i++) {

            for (let j = 0; j < this.repeatNumber; j++) {

                const population  = new Population('Genetic Algorithm!', i, false);
                this.previousGen.push(population.run());

            }

            const group = this.previousGen.filter(s => s.size === i);

            const avgGen = Math.round(group.map(gen => gen.numGen)
                .reduce((a, b) => (a + b)) / this.repeatNumber);

            const avgTime = Math.round(group.map(gen => gen.time)
                .reduce((a, b) => (a + b)) / this.repeatNumber);

            const sameSize = group[0].size;

            const avgObj = {
                numGen: avgGen,
                size: sameSize,
                time: avgTime,
            };

            averageOverIterations.push(avgObj);

        }

        averageOverIterations.sort((a, b) => a.numGen - b.numGen);

        const { numGen, size, time } = averageOverIterations[0];

        console.log(`
        *****
        Max populatation size: ${this.maxGeneration}
        Iterations per generation: ${this.repeatNumber}

        *****
        Optimum populatation size: ${size}
        Average number of generations: ${numGen}
        Average time: ${time}ms

        *****
        OptimumPopulationSize execution time: ${Date.now() - now}ms`);

    }

}

const popSize = new OptimumPopulationSize();
popSize.runPop();
