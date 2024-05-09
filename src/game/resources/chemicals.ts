import { Registry } from "../registry";

export type ChemicalOptions = {
    symbol: string;
    name: string;
    color: string;
    description: string;
};

export class ChemicalRegistry extends Registry<Chemical> {
    public register(item: Chemical) {
        super.register(item);
    }

    public registerChemical(options: ChemicalOptions) {
        let item = new Chemical(options);
        this.register(item);
        return item;
    }
}

class Chemical {
    public id: string;

    public symbol: string;
    public name: string;
    public color: string;
    public description: string;

    constructor(options: ChemicalOptions) {
        this.id = options.symbol;

        this.symbol = options.symbol;
        this.name = options.name;
        this.color = options.color;
        this.description = options.description;
    }
}
