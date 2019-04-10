import Entity from './entity';
import performance from './performance';
import System from './system';
import { fastSplice } from './utils';

/**
 * ECS
 */
export class ECS {
    /** all entities of the ECS.  */
    private entities: Entity[] = [];
    /** Store entities which need to be tested at beginning of next tick. */
    public entitiesSystemsDirty: Entity[] = [];
    /** Store all systems of the ECS. */
    private systems: System[] = [];
    /** Count how many updates have been done. */
    private updateCounter: number = 0;
    private lastUpdate: number = performance.now();
    /**
     * Retrieve an entity by id
     */
    public getEntityById(id: Number) {
        for (const entity of this.entities) {
            if (entity.id === id) {
                return entity;
            }
        }

        return;
    }
    /**
     * Add an entity to the ecs.
     *
     * @param entity The entity to add.
     */
    public addEntity(entity: Entity) {
        this.entities.push(entity);
        entity.addToECS(this);
    }
    /**
     * Remove an entity from the ecs by reference.
     *
     * @param entity reference of the entity to remove
     */
    public removeEntity(entity: Entity) {
        const index = this.entities.indexOf(entity);
        let entityRemoved: Entity;

        // if the entity is not found do nothing
        if (index !== -1) {
            entityRemoved = this.entities[index];

            entity.dispose();
            this.removeEntityIfDirty(entityRemoved);

            fastSplice(this.entities, index, 1);
        }

        return entityRemoved;
    }
    /**
     * Remove an entity from the ecs by entity id.
     *
     * @param  entityId id of the entity to remove
     */
    public removeEntityById(entityId: number) {
        for (let i = 0; i < this.entities.length; i += 1) {
            const entity = this.entities[i];
            if (entity.id === entityId) {
                entity.dispose();
                this.removeEntityIfDirty(entity);

                fastSplice(this.entities, i, 1);
                return entity;
            }
        }
    }
    /**
     * Remove an entity from dirty entities by reference.
     *
     * @param  entity entity to remove
     */
    private removeEntityIfDirty(entity: Entity) {
        const index = this.entitiesSystemsDirty.indexOf(entity);

        if (index !== -1) {
            fastSplice(this.entities, index, 1);
        }
    }
    /**
     * Add a system to the ecs.
     *
     * @param system system to add
     */
    public addSystem(system: System) {
        this.systems.push(system);

        // iterate over all entities to eventually add system
        for (const entity of this.entities) {
            if (system.test(entity)) {
                system.addEntity(entity);
            }
        }
    }
    /**
     * Remove a system from the ecs.
     *
     * @param system system reference
     */
    public removeSystem(system: System) {
        const index = this.systems.indexOf(system);

        if (index !== -1) {
            fastSplice(this.systems, index, 1);
            system.dispose();
        }
    }
    /**
     * "Clean" entities flagged as dirty by removing unnecessary systems and
     * adding missing systems.
     */
    private cleanDirtyEntities() {
        for (const entity of this.entitiesSystemsDirty) {
            for (const system of this.systems) {
                // for each dirty entity for each system
                const index = entity.systems.indexOf(system);
                const entity_test = system.test(entity);

                if (index === -1 && entity_test) {
                    // if the entity is not added to the system yet and should be, add it
                    system.addEntity(entity);
                } else if (index !== -1 && !entity_test) {
                    // if the entity is added to the system but should not be, remove it
                    system.removeEntity(entity);
                }
                // else we do nothing the current state is OK
            }

            entity.systemsDirty = false;
        }

        this.entitiesSystemsDirty = [];
    }
    /**
     * Update the ecs.
     */
    public update() {
        const now = performance.now();
        const elapsed = now - this.lastUpdate;

        for (const system of this.systems) {
            if (this.updateCounter % system.frequency > 0) {
                break;
            }

            if (this.entitiesSystemsDirty.length) {
                // if the last system flagged some entities as dirty check that case
                this.cleanDirtyEntities();
            }

            system.updateAll(elapsed);
        }

        this.updateCounter += 1;
        this.lastUpdate = now;
    }
}
