
import { supabase } from './supabase';
import { AppState } from '../types';

export const saveAppState = async (state: AppState) => {
    if (!state.currentUser || !state.currentEntity) {
        throw new Error('User or Entity not set');
    }

    const stateToSave = {
        user_id: state.currentUser.id,
        entity_id: state.currentEntity.id,
        current_year: state.currentYear,
        email: state.currentUser.email,
        role: state.currentUser.role,
        fund_data: state.fundData,
        personale_servizio: state.personaleServizio,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
        .from('user_app_state')
        .upsert(stateToSave, { onConflict: 'entity_id, current_year' });

    if (error) {
        console.error('Error saving app state:', error);
        throw error;
    }
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
