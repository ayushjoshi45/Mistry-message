import {z} from 'zod';

export const usernameValidation=z
    .string()
    .min(3,"Username must be atleast 3 Characters Long")
    .max(20,"Username must be atmost 20 characters long").
    regex(/[^a-zA-Z0-9]+$/,"Username can not contain characters")


    export const signUpSchema=z.object({
        username:usernameValidation,
        email:z.string().email({message:"Invalid Email Address"}),
        password:z.string().min(6,"Password must be atleast 6 characters Long"),
    })