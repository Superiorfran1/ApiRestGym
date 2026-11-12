import { loadDB,saveToDatabase,createWorkout,deleteWorkout as eliminarWorkout, updateWorkout } from "../database/ficheros";
import { Filtros, Workout } from "../types/workout";
import {v4 as uuid} from "uuid";
import { toHttpError } from "../utils/httpError";

export function getAllWorkouts(){
    return loadDB().workouts;
}
    
export function getWorkout(id:string){
    try{
    return loadDB().workouts.find((workout) => workout.id == id) ?? null;
    }catch(error){
        throw toHttpError(error);
    }
}

export function postWorkout(workout:Workout){
    try{
    const id:string = uuid();
    const fechaCreacion = Date.now();
    const fechaActualizacion = Date.now();
    workout.id = id;
    workout.createdAt = fechaCreacion.toString();
    workout.updatedAt = fechaActualizacion.toString();
    return createWorkout(workout);
    }catch(error){
        throw toHttpError(error);
    }
}
export function patchWorkout(workout:Workout){
    try{
    workout.updatedAt = Date.now().toString();
    let workoutAnt:Workout = getWorkout(workout.id)!;
    if(workout.equipment == null) workout.equipment = workoutAnt.equipment;
    if(workout.exercises == null) workout.exercises = workoutAnt.exercises;
    if(workout.name == null) workout.name = workoutAnt.name;
    if(workout.mode == null) workout.mode = workoutAnt.mode;
    if(workout.trainerTips == null) workout.trainerTips = workoutAnt.trainerTips;
    workout.createdAt = workoutAnt.createdAt;
    return updateWorkout(workout);
    } catch(error){
        throw toHttpError(error);
    }
}
export function deleteWorkout(id:string){
    try{
    return eliminarWorkout(id);
    }catch(error){
        throw toHttpError(error);
    }
}