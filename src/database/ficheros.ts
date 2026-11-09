import {readFileSync,writeFileSync} from 'fs';
import path from 'path';
import type{ Database, Workout} from '../types/workout';
import { toHttpError } from '../utils/httpError';

const DB_PATH:string = path.resolve(import.meta.dirname,"../../data/db.json");

export const loadDB = ():Database => JSON.parse(readFileSync(DB_PATH,"utf-8"));
export const saveToDatabase = (db:Database):void => writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
export const createWorkout = (workout:Workout):boolean => {
    try{
    let database: Database = loadDB();
    database.workouts.push(workout);
    saveToDatabase(database);
    return true;
    }catch(error){
        throw toHttpError(error);
    }
}
export const deleteWorkout = (id:string):boolean => {
    try{
    let database: Database = loadDB();
    database.workouts = database.workouts.filter((workout) => workout.id != id);
    saveToDatabase(database);
    return true;
    }catch(error){
        throw toHttpError(error);
    }
}
export const updateWorkout = (workout:Workout):boolean => {
    try{
    let database: Database = loadDB();
    database.workouts = database.workouts.filter((workoutLista) => workout.id != workoutLista.id);
    database.workouts.push(workout);
    saveToDatabase(database);
    return true;
    }catch(error){
        throw toHttpError(error);
    }
}