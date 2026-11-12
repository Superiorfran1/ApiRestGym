import { createRecord, deleteRecord as eliminarRecord, loadDB, updateRecord } from "../database/ficheros";
import type { RecordFilters, WorkoutRecord } from "../types/workout";
import { v4 as uuid } from "uuid";
import { toHttpError } from "../utils/httpError";

const DEFAULT_MEMBER_ID = "default-member";

export function getAllRecords(filters: RecordFilters = {}): WorkoutRecord[] {
    try {
        let records = loadDB().records;
        if (filters.workout !== undefined) {
            records = records.filter((record) => record.workout === filters.workout);
        }
        if (filters.record !== undefined) {
            records = records.filter((record) =>
                record.record.toLowerCase().includes(filters.record!.toLowerCase())
            );
        }
        if (filters.memberId !== undefined) {
            records = records.filter((record) => record.memberId === filters.memberId);
        }
        return records;
    } catch (error) {
        throw toHttpError(error);
    }
}

export function getRecord(id: string): WorkoutRecord | null {
    try {
        return loadDB().records.find((record) => record.id === id) ?? null;
    } catch (error) {
        throw toHttpError(error);
    }
}

export function postRecord(record: Omit<WorkoutRecord, "id">): boolean {
    try {
        const memberId = record.memberId ?? DEFAULT_MEMBER_ID;
        return createRecord({
            ...record,
            id: uuid(),
            memberId,
            member: `/members/${memberId}`
        });
    } catch (error) {
        throw toHttpError(error);
    }
}

export function patchRecord(id: string, changes: Partial<WorkoutRecord>): boolean | null {
    try {
        const currentRecord = getRecord(id);
        if (currentRecord === null) return null;

        const memberId = changes.memberId ?? currentRecord.memberId ?? DEFAULT_MEMBER_ID;
        return updateRecord({
            ...currentRecord,
            ...changes,
            id,
            memberId,
            member: `/members/${memberId}`
        });
    } catch (error) {
        throw toHttpError(error);
    }
}

export function deleteRecord(id: string): boolean {
    try {
        return eliminarRecord(id);
    } catch (error) {
        throw toHttpError(error);
    }
}
