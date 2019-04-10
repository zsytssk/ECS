import Entity from './entity';
import { fastSplice } from './utils';

/**
 * @description  A system update all eligible entities at a given frequency.
 */
abstract class System {
    /**
     * Frequency of update execution, a frequency of `1` run the system every
     * update, `2` will run the system every 2 updates, ect.
     */
    public frequency: number;
    /**
     * Entities of the system.
     */
    private entities: Entity[] = [];
    /**
     * @class  System
     * @constructor
     * @param [frequency=1] {Number} Frequency of execution.
     */
    constructor(frequency = 1) {
        this.frequency = frequency;

        this.entities = [];
    }
    /**
     * Add an entity to the system entities.
     */
    public addEntity(entity: Entity) {
        entity.addSystem(this);
        this.entities.push(entity);

        this.enter(entity);
    }
    /**
     * Remove an entity from the system entities. exit() handler is executed
     * only if the entity actually exists in the system entities.
     * @param  entity Reference of the entity to remove.
     */
    public removeEntity(entity: Entity) {
        let index = this.entities.indexOf(entity);

        if (index !== -1) {
            entity.removeSystem(this);
            fastSplice(this.entities, index, 1);

            this.exit(entity);
        }
    }
    /**
     * Apply update to each entity of this system.
     */
    public updateAll(elapsed: number) {
        this.preUpdate();

        for (const entity of this.entities) {
            this.update(entity, elapsed);
        }

        this.postUpdate();
    }
    /**
     * dispose the system by exiting all the entities
     */
    public dispose() {
        for (const entity of this.entities) {
            entity.removeSystem(this);
            this.exit(entity);
        }
    }
    /**
     * Called once per update, before entities iteration.
     */
    protected abstract preUpdate(): void;
    /**
     * Called once per update, after entities iteration.
     */
    protected abstract postUpdate(): void;
    /**
     * Should return true if the entity is eligible
     * to the system, false otherwise.
     * @param  entity The entity to test.
     */
    public test(entity: Entity) {
        return false;
    }
    /**
     * Called when an entity is added to the system.
     * @param entity The added entity.
     */
    public abstract enter(entity: Entity): void;
    /**
     * Called when an entity is removed from the system.
     * @param entity The removed entity.
     */
    public abstract exit(entity: Entity): void;
    /**
     * Called for each entity to update. This is
     * the only method that should actual mutate entity state.
     * @param  entity The entity to update.
     */
    public abstract update(entity: Entity, elapsed?: number): void;
}
// jshint unused:true

export default System;
