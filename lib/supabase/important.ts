import { supabase } from "./client";

export interface ImportantItem {
    id: number;
    course_id: number;
    item_type: 'quiz_question' | 'numerical';
    item_id: number;
    sub_id: number;
}

export async function toggleImportantItem({
    userId,
    courseId,
    type,
    itemId,
    subId = 0
}: {
    userId: number;
    courseId: number;
    type: 'quiz_question' | 'numerical';
    itemId: number;
    subId?: number;
}) {
    // Check if exists
    const { data: existing } = await supabase
        .from("important_items")
        .select("id")
        .match({
            user_id: userId,
            course_id: courseId,
            item_type: type,
            item_id: itemId,
            sub_id: subId
        })
        .single();

    if (existing) {
        // Delete (Unstar)
        await supabase
            .from("important_items")
            .delete()
            .eq("id", existing.id);
        return false; // Not important anymore
    } else {
        // Insert (Star)
        await supabase
            .from("important_items")
            .insert({
                user_id: userId,
                course_id: courseId,
                item_type: type,
                item_id: itemId,
                sub_id: subId
            });
        return true; // Now important
    }
}

export async function getImportantItems({
    userId,
    courseId,
    type
}: {
    userId: number;
    courseId: number;
    type?: 'quiz_question' | 'numerical';
}): Promise<ImportantItem[]> {
    let query = supabase
        .from("important_items")
        .select("*")
        .eq("user_id", userId)
        .eq("course_id", courseId);

    if (type) {
        query = query.eq("item_type", type);
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching important items:", error);
        return [];
    }
    return data as ImportantItem[];
}
