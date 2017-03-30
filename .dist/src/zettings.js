"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_source_1 = require("./env-source");
const memory_source_1 = require("./memory-source");
const simple_logger_1 = require("./simple-logger");
const Log = new simple_logger_1.default('Zettings');
class Zettings {
    constructor(options) {
        this.DEF_PROFILE = 'DEFAULT_PROFILE';
        this.sources = [];
        this.nameKeys = {};
        this.counter = { total: 0 };
        options = options || {};
        this.profile = options.profile || this.DEF_PROFILE;
        this.lowestPriority = 0;
        options.defaultMemoSource = getFirstValid(options.defaultMemoSource, true);
        options.defaultEnvSource = getFirstValid(options.defaultEnvSource, true);
        let memoPriority = getFirstValid(options.defaultMemoSourcePriority, 1);
        let envPriority = getFirstValid(options.defaultEnvSourcePriority, 5);
        if (options.defaultMemoSource)
            this.addSource(new memory_source_1.default({}), memoPriority, this.profile);
        if (options.defaultEnvSource)
            this.addSource(new env_source_1.default(), envPriority, this.profile);
    }
    addSource(source, priority, profile) {
        if (priority === undefined && profile === undefined) {
            priority = this.lowestPriority + 1;
            profile = this.profile;
        }
        else if (typeof priority === 'string' && profile === undefined) {
            profile = priority;
            priority = this.lowestPriority + 1;
        }
        else if (typeof priority === 'number' && profile === undefined) {
            profile = this.profile;
        }
        else if (typeof priority !== 'number' || typeof profile !== 'string') {
            throw Error('Invalid parameters. Expected (Object, [number, string]) or (Object, [number|string]) but found (' + typeof source + ', ' + typeof priority + ', ' + typeof profile + ')');
        }
        if (profile === 'total') {
            throw new Error("'total' is a reserver keyword and can't be used as a profile.");
        }
        this.lowestPriority = priority > this.lowestPriority ? priority : this.lowestPriority;
        this.counter[profile] = this.counter[profile] || 0;
        this.counter[profile]++;
        this.counter['total']++;
        const composedName = profile + ':' + source.name;
        if (this.nameKeys[composedName]) {
            throw new Error("The name '" + source.name + "' already exists in the '" + profile + "' profile");
        }
        this.nameKeys[composedName] = true;
        Log.d("New source added ->  { name: '" + source.name + "', profile: '" + profile + "' }");
        this.sources.push({ priority: priority, profile, source: source });
        this.sources = this.sources.sort((sourceA, sourceB) => {
            return sourceA.priority - sourceB.priority;
        });
    }
    count(profile) {
        profile = profile || 'total';
        return this.counter[profile] || 0;
    }
    changeProfile(profile) {
        this.profile = profile;
    }
    get(key, def) {
        let keys = key.replace(/]/g, '').split(/[\[.]/g);
        for (let i = 0; i < this.sources.length; i++) {
            const prioritySource = this.sources[i];
            const source = prioritySource.source;
            if (prioritySource.profile !== this.profile)
                continue;
            const value = source.get(keys);
            if (value === undefined)
                continue;
            return value;
        }
        return def;
    }
    getf(key, def) {
        const value = this.get(key, def);
        if (value == undefined || value == null)
            throw new Error("No available setting for key '" + key + "'");
        return value;
    }
    set(key, value) {
        let keys = key.replace(/]/g, '').split(/[\[.]/g);
        let isSetSupported = false;
        for (let i = 0; i < this.sources.length; i++) {
            const prioritySource = this.sources[i];
            const source = prioritySource.source;
            if (typeof source.set == "function" && this.profile == prioritySource.profile) {
                isSetSupported = true;
                source.set(keys, value);
            }
        }
        if (!isSetSupported)
            throw new Error("There is no source configured that implements the 'set' method");
    }
}
exports.default = Zettings;
function getFirstValid(...values) {
    for (let i = 0; i < values.length; i++) {
        if (values[i] != undefined && values[i] != null)
            return values[i];
    }
}
exports.getFirstValid = getFirstValid;
//# sourceMappingURL=zettings.js.map