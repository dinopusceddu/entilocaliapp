
import { supabase } from './supabase';
import { AppState } from '../types';

/** Legacy writer intentionally disabled: no loaded version was supplied by this API. */
export const saveAppState = async (_state: AppState): Promise<never> => {
    throw new Error('STATE_VERSION_REQUIRED: utilizzare il repository versionato con la baseline del draft.');
};

export const loadAppState = async (entityId: string, year: number) => {
    const { data, error } = await supabase
        .from('user_app_state')
        .select('*')
        .eq('entity_id', entityId)
        .eq('current_year', year)
        .single();

    if (error) {
        throw error;
    }

    return data;
};
