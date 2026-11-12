import type { Request, Response } from "express";
import * as recordService from "../services/recordService";
import type { RecordFilters, WorkoutRecord } from "../types/workout";

export function getAllRecords(request: Request, response: Response) {
    const filters: RecordFilters = {
        workout: typeof request.query.workout === "string" ? request.query.workout : undefined,
        record: typeof request.query.record === "string" ? request.query.record : undefined,
        memberId: typeof request.query.memberId === "string" ? request.query.memberId : undefined
    };

    response.send({
        status: "ok",
        data: recordService.getAllRecords(filters)
    });
}

export function getRecord(request: Request, response: Response) {
    response.send({
        status: 200,
        data: recordService.getRecord(request.params.id.toString())
    });
}

export function postRecord(request: Request, response: Response) {
    const body = request.body ?? {};
    if (typeof body.workout !== "string" || typeof body.record !== "string") {
        response.status(400).send({
            status: "fail",
            data: "Bad request"
        });
        return;
    }

    const record: Omit<WorkoutRecord, "id"> = {
        workout: body.workout,
        record: body.record,
        memberId: typeof body.memberId === "string" ? body.memberId : undefined
    };
    response.status(201).send({
        status: "ok",
        data: recordService.postRecord(record)
    });
}

export function patchRecord(request: Request, response: Response) {
    const body = request.body ?? {};
    if (
        body.id != null ||
        body.member != null ||
        (body.workout != null && typeof body.workout !== "string") ||
        (body.record != null && typeof body.record !== "string") ||
        (body.memberId != null && typeof body.memberId !== "string")
    ) {
        response.status(400).send({
            status: "fail",
            data: "Bad request"
        });
        return;
    }

    const updated = recordService.patchRecord(request.params.id.toString(), {
        workout: body.workout,
        record: body.record,
        memberId: body.memberId
    });
    if (updated === null) {
        response.status(404).send({
            status: "fail",
            data: "Record not found"
        });
        return;
    }

    response.send({
        status: "ok",
        data: updated
    });
}

export function deleteRecord(request: Request, response: Response) {
    response.send({
        status: 200,
        data: recordService.deleteRecord(request.params.id.toString())
    });
}
