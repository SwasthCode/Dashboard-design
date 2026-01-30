import stateData from './india-states-districts-data.json';

interface State {
    name: string;
    districts: string[];
}

interface IndiaData {
    states: State[];
    union_territories: State[];
}

const data = stateData as IndiaData;

export function getAllStates(): string[] {
    const states = data.states.map(state => state.name);
    const unionTerritories = data.union_territories.map(ut => ut.name);
    return [...states, ...unionTerritories].sort();
}

export function getDistrictsByState(stateName: string): string[] | null {
    if (!stateName) return null;

    const state = data.states.find(s => s.name.toLowerCase() === stateName.toLowerCase());
    if (state) return state.districts.sort();

    const ut = data.union_territories.find(u => u.name.toLowerCase() === stateName.toLowerCase());
    if (ut) return ut.districts.sort();

    return null;
}

export function getAllStatesWithDistricts() {
    return [...data.states, ...data.union_territories];
}
