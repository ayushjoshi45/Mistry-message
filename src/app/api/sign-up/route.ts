import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import UserModel from "@/models/User";

import { sendVerficationEmail } from "@/helpers/sendVerificationEmail";
import { success } from "zod";

export async function POST(request:Request){
    await dbConnect();
    console.log("key", process.env.RESEND_API_KEY)
    try {
        const {username, email, password}=await request.json();

        const existingUserVerifiedByUsername= await UserModel.findOne({
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

    const existingUserByEmail= await UserModel.findOne({
        email,
    })

    const verifyCode=Math.floor(100000+Math.random()*900000).toString();
    if(existingUserByEmail){
        if(existingUserByEmail.isVerified){
            return Response.json({
                success:false,
                message:"User with this email already exist",
            },{status:400})
        } else{
            const hashedPassword=await bcrypt.hash(password,10);
            existingUserByEmail.password=hashedPassword;
            existingUserByEmail.verifyCode=verifyCode;
            existingUserByEmail.verifyCodeExpiry=new Date(Date.now()+3600000)
            await existingUserByEmail.save();
        }
    }
    else{
        const hashedPassword= await bcrypt.hash(password,10);
        const expiryDate=new Date();
        expiryDate.setHours(expiryDate.getHours()+1);
        const newUser=new UserModel({
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
    // send verification email 
    const emailResponse = await sendVerficationEmail(
        email,
        username,
        verifyCode
    )
    if(!emailResponse.success){ 
        return Response.json({
            success:false,
            message: "Failed to send verification email", 
        },{status:500})
    }

     return Response.json({
            success:true,
            message: "User Register Successfully. Please verify your Email", 
        },{status:201})

    } catch (error) {
        console.error("Error in sign-up route:", error);
        return new Response(JSON.stringify({
            success:false,
            message:"Internal server error at catch",
        }), {status:500});
    }
}