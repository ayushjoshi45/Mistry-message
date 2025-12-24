import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import userModel from "@/models/User";

import { sendVerficationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request:Request){
    await dbConnect();
    try {
        const {username, email, password}=await request.json();

        const existingUserVerifiedByUsername= await userModel.findOne({
            username,
            isVerified:true,
        }
    )

    if(existingUserVerifiedByUsername){
        return Response.json({
            success:false,
            message:"username already taken",
        },{
            status:400,
        })
    }

    const existingUserByEmail= await userModel.findOne({
        email,
    })

    if(existingUserByEmail){

    }
    else{
        const hashedPassword= await bcrypt.hash(password,10);
        const expiryDate=new Date();
        expiryDate.setHours(expiryDate.getHours()+1);
        const verifyCode=Math.floor(100000+Math.random()*900000).toString();
        const newUser=new userModel({
            username,
            email,
            password:hashedPassword,
            verifyCode:verifyCode,
            verifyCodeExpiry:expiryDate,
            isVerified:false,
            isAcceptingMessages:true,
            messages:[],
        })
        await newUser.save();
    }
    } catch (error) {
        console.error("Error in sign-up route:", error);
        return new Response(JSON.stringify({
            success:false,
            message:"Internal server error",
        }), {status:500});
    }
}