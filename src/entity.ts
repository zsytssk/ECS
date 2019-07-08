/**
 * @module  ecs
 */

import { Component, ComProps, ComPropsObj } from './component';
import { ECS } from './ecs';
import System from './system';
import { DefaultUIDGenerator } from './uid';
import { fastSplice } from './utils';

/**
 * An entity.
 *
 * @class  Entity
 */
abstract class Entity {
    /** Unique identifier of the entity. */
    public id: number;
    private ecs: ECS;
    /** Systems applied to the entity. */
    public systems: System[] = [];
    /**
     * Indiquate a change in components (a component was removed or added)
     * which require to re-compute entity eligibility to all systems.
     */
    public systemsDirty: boolean = false;
    /**
     * Components of the entity stored as key-value pairs.
     * @property Map components
     */
    private components: Map<String, Component> = new Map();
    /**
     * @param idOrUidGenerator The entity id if
     * a Number is passed. If an UIDGenerator is passed, the entity will use
     * it to generate a new id. If nothing is passed, the entity will use
     * the default UIDGenerator.
     *
     * @param components An array of initial components.
     */
    constructor(components: Component[] = []) {
        // if nothing was passed simply use the default generator
        this.id = DefaultUIDGenerator.next();

        // components initialize
        for (const component of components) {
            this.components.set(component.name, component);
        }
    }
    /**
     * Set the parent ecs reference.
     * @param {ECS} ecs An ECS class instance.
     */
    public addToECS(ecs) {
        this.ecs = ecs;
        this.setSystemsDirty();
    }
    /**
     * Set the systems dirty flag so the ECS knows this entity
     * needs to recompute eligibility at the beginning of next
     * tick.
     */
    public setSystemsDirty() {
        if (!this.systemsDirty && this.ecs) {
            this.systemsDirty = true;

            // notify to parent ECS that this entity needs to be tested next tick
            this.ecs.entitiesSystemsDirty.push(this);
        }
    }
    /**
     * Add a system to the entity.
     * @param system The system to add.
     */
    public addSystem(system: System) {
        this.systems.push(system);
    }
    /**
     * Remove a system from the entity.
     * @param system The system reference to remove.
     */
    public removeSystem(system: System) {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            fastSplice(this.systems, index, 1);
        }
    }
    /**
     * Add a component to the entity. WARNING this method does not copy
     * components data but assign directly the reference for maximum
     * performances. Be sure not to pass the same component reference to
     * many entities.
     *
     * @param   name Attribute name of the component to add.
     * @param component Component data.
     */
    public addComponent(name: string, component: Component) {
        this.components.set(name, component);
        this.setSystemsDirty();
    }
    /**
     * Remove a component from the entity. To preserve performances, we
     * simple set the component property to `undefined`. Therefore the
     * property is still enumerable after a call to removeComponent()
     *
     * @param   name Name of the component to remove.
     */
    public removeComponent(name: String) {
        if (!this.components.get(name)) {
            return;
        }
        this.components.delete(name);
        this.setSystemsDirty();
    }
    /**
     * Update a component field by field, NOT recursively. If the component
     * does not exists, this method create it silently.
     *
     * @param  name Name of the component
     * @param data Dict of attributes to update
     */
    public updateComponent(name: string, data: ComProps) {
        const component = this.components.get(name);

        for (const key in data) {
            if (!data.hasOwnProperty(key)) {
                continue;
            }
            component[key] = data[key];
        }
    }
    /**
     * Update a set of components.
     *
     * @param componentsData Dict of components to update.
     */
    public updateComponents(componentsData: ComPropsObj) {
        for (const key in componentsData) {
            if (!componentsData.hasOwnProperty(key)) {
                continue;
            }
            this.updateComponent(key, componentsData[key]);
        }
    }
    /**
     * Dispose the entity.
     */
    public dispose() {
        for (const system of this.systems) {
            system.removeEntity(this);
        }
    }
}

export default Entity;
