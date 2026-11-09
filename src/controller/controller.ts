import type{Express,Request,Response} from "express";
import * as workoutService from "../services/workoutService";
import type { Filtros, Workout } from "../types/workout.ts";


export function getAllWorkouts(request:Request,response:Response){
    const {mode} = request.query;
    const {equipment} = request.query;
    const {name} = request.query;
    const {exercise} = request.query;
    let workouts:Workout[] = workoutService.getAllWorkouts();
    let filtros:Filtros = {mode,equipment,name,exercise} as Filtros;
    if (filtros.name != undefined) workouts = workouts.filter((workout) => workout.name.includes(filtros.name));
    if (filtros.mode != undefined) workouts = workouts.filter((workout) => workout.mode.toLowerCase() == filtros.mode.toLowerCase());
    if (filtros.equipment != undefined && filtros.equipment.length > 0) workouts =  workouts.filter((workout) => workout.equipment.some((equipment) => equipment == filtros.equipment));
    if (filtros.equipment != undefined && filtros.equipment.length > 0) workouts =  workouts.filter((workout) => workout.equipment.some((equipment) => equipment == filtros.equipment));
    if (filtros.exercise != undefined && filtros.exercise.length > 0) workouts = workouts.filter((workout) => workout.exercises.some((workoutExercise) => workoutExercise.toLowerCase() == filtros.exercise.toLowerCase()));
    response.send({
    status: 'ok',
    data: workouts
    });
}
export function getWorkouts(request:Request,response:Response){
    const id = request.params.id;
    if (id == undefined){
        response.status(400).send({
            status: 'fail',
            data: 'Bad request'
        });
    }else {
        response.send({
            status:200,
            data: workoutService.getWorkout(id.toString())
        });
    }
    
}

export function postWorkout(request:Request,response:Response){
    const body:Workout = request.body ?? {};
    if (body.name == null || body.exercises == null ||  body.equipment == null || body.mode == null || body.trainerTips == null) {
        response.status(400).send({
            status: 'fail',
            data: 'Bad request'
        });
    } else {
    response.status(201).send({
        status: 'ok',
        data: workoutService.postWorkout(body)
    });
}
}
export function patchWorkout(request:Request,response:Response){
    const id = request.params.id;
    if (id == undefined){
        response.status(400).send({
            status: 'fail',
            data: 'Bad request'
        });
    } else{
        const body:Workout = request.body ?? {};
        if (body.id != null || body.createdAt != null){
            response.status(400).send({
            status: 'fail',
            data: 'Bad request'
            });
        } else {
            body.id = id.toString();
            response.status(201).send({
                status: 'ok',
                data: workoutService.patchWorkout(body)
            });
        }
    }
}
export function deleteWorkout(request:Request,response:Response){
    const id = request.params.id;
    if (id == undefined){
        response.status(400).send({
            status: 'fail',
            data: 'Bad request'
        });
    } else{
        response.send({
            status:200,
            data: workoutService.deleteWorkout(id.toString())
        });
    }
}