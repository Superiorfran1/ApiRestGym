export interface Workout{
    id:string,
    name:string,
    mode:string,
    equipment:string[],
    exercises:string[],
    createdAt:string,
    updatedAt:string,
    trainerTips:string[]
}

export interface WorkoutRecord{
    id:string,
    workout:string,
    record:string,
    memberId?:string,
    member?:string
}

export interface RecordFilters{
    workout?:string,
    record?:string,
    memberId?:string
}
export interface Miembro{
    id:string,
    name:string,
    gender:string,
    dateOfBirth:string,
    email:string,
    password:string
}
export interface Database{
    workouts:Workout[],
    members:Miembro[],
    records:WorkoutRecord[]
}
export interface Filtros{
    mode:string,
    equipment:string,
    name:string,
    exercise:string
}