import { type Result, resultAuto } from "../utils/result";
import { Game } from "../Game";
import { type DataResource, Resource, type ResourceOptions } from "./resources";
import { ticking } from "../ticks";

export interface IResourceRegistry {
    get registeredResources(): readonly Resource[];

    registerResource: (resource: ResourceOptions) => Resource;
    getResource: (type: new () => Resource) => Result<Resource>;
    getResourceById: (id: string) => Result<Resource>;
    loadAll: () => void;
    saveAll: () => void;
}

type ResourceStructure = {
    [k: string]: DataResource;
};

export class ResourceRegistry implements IResourceRegistry {
    constructor(public game: Game) {
        setInterval(this.saveAll, 100);
    }

    private _registeredResources: Resource[] = [];

    public get registeredResources(): readonly Resource[] {
        return this._registeredResources;
    }

    public readonly registerResource = (options: ResourceOptions): Resource => {
        let resource = new Resource(options);
        this._registeredResources.push(resource);
        this.game.Ticker.track(resource);
        resource.ready();
        return resource;
    };

    public readonly getResource = (
        type: new () => Resource,
    ): Result<Resource> => {
        let resource = this._registeredResources.find(
            (it) => it instanceof type,
        );
        return resultAuto({
            value: resource,
            error: `invalid resource type: ${type.name}`,
        });
    };

    public readonly getResourceById = (id: string): Result<Resource> => {
        let resource = this._registeredResources.find((it) => it.id == id);
        return resultAuto({
            value: resource,
            error: `invalid resource id: ${id}`,
        });
    };

    public readonly loadAll = () => {
        let structure = <ResourceStructure>(
            JSON.parse(localStorage.getItem("resources"))
        );
        if (structure == undefined) {
            return;
        }
        for (let resource of this._registeredResources) {
            if (structure[resource.id])
                resource.restoreFrom(structure[resource.id]);
        }
    };

    public readonly saveAll = () => {
        let structure: ResourceStructure = {};
        for (let resource of this._registeredResources) {
            structure[resource.id] = resource.serialize();
        }

        localStorage.setItem("resources", JSON.stringify(structure));
    };
}
