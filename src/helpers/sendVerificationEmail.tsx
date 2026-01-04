import {resend} from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmail from "../../email/verificationEmail";

export async function sendVerficationEmail(
    email:string,
    username:string,
    verifyCode:string,)
: Promise<ApiResponse>{
    try { 
        await resend.emails.send({
         from: "onboarding@resend.dev",
         to: email,
         subject: "Mistry verification code",
         react: <VerificationEmail username={username} otp={verifyCode} />,
            })
            return {
            success:true,
            message:"Verification email sent successfully",
            };
    } catch (emailError) {
        console.error("Error sending verfication email:", emailError)
        return {
            success:false,
            message:"Failed to send verification email",
        }
    }
}