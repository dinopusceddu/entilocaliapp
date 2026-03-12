import { supabase } from './supabase';
import { AppFeedback, FeedbackType, FeedbackStatus } from '../types';

export const submitFeedback = async (feedback: {
    type: FeedbackType;
    title: string;
    description: string;
    user_id: string;
    user_name: string;
}) => {
    const { data, error } = await supabase
        .from('app_feedback')
        .insert([
            {
                ...feedback,
                status: FeedbackStatus.OPEN,
                created_at: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (error) {
        console.error('Error submitting feedback:', error);
        throw error;
    }

    return data as AppFeedback;
};

export const getAllFeedback = async () => {
    const { data, error } = await supabase
        .from('app_feedback')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching feedback:', error);
        throw error;
    }

    return data as AppFeedback[];
};

export const getUserFeedback = async (userId: string) => {
    const { data, error } = await supabase
        .from('app_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user feedback:', error);
        throw error;
    }

    return data as AppFeedback[];
};

export const updateFeedbackStatus = async (id: string, status: FeedbackStatus, adminNotes?: string) => {
    const { data, error } = await supabase
        .from('app_feedback')
        .update({ status, admin_notes: adminNotes })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating feedback status:', error);
        throw error;
    }

    return data as AppFeedback;
};

export const deleteFeedback = async (id: string) => {
    const { error } = await supabase
        .from('app_feedback')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting feedback:', error);
        throw error;
    }
};
