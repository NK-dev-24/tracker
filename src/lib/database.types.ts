export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    has_paid: boolean;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    has_paid?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    has_paid?: boolean;
                    created_at?: string;
                };
            };
            daily_logs: {
                Row: {
                    id: string;
                    user_id: string;
                    log_date: string;
                    completed_tasks: string[];
                    all_complete: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    log_date: string;
                    completed_tasks?: string[];
                    all_complete?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    log_date?: string;
                    completed_tasks?: string[];
                    all_complete?: boolean;
                    created_at?: string;
                };
            };
            challenges: {
                Row: {
                    id: string;
                    user_id: string;
                    start_date: string | null;
                    current_day: number;
                    streak_active: boolean;
                    last_completed_date: string | null;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    start_date?: string | null;
                    current_day?: number;
                    streak_active?: boolean;
                    last_completed_date?: string | null;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    start_date?: string | null;
                    current_day?: number;
                    streak_active?: boolean;
                    last_completed_date?: string | null;
                    updated_at?: string;
                };
            };
        };
    };
}
