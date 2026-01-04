import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request:Request){
    await dbConnect();
    try {
        const {username, code}= await request.json();

        const decodedUsername=decodeURIComponent(username);
        const user=await UserModel.findOne({username:decodedUsername})

        if(!user){
            return Response.json({
                success:false,
                message:"User not Found",
            },{status:500})
        }
        const iscodeValid=user.verifyCode==code;
        const isCodeNotExpired= new Date(user.verifyCodeExpiry)>new Date();

        if(isCodeNotExpired && iscodeValid){
            user.isVerified=true;
            await user.save();

            return Response.json({
                success:true,
                message:"User Verified Successfully",
            },{status:200})
        } else if(!isCodeNotExpired){
             return Response.json({
                success:false,
                message:"Verification Code Expire Please Signup Again to get new Verified Code",
            },{status:400})
        }
        else{
             return Response.json({
                success:false,
                message:"Verification Code is Incorrect",
            },{status:400})
        }
    } catch (error) {
        console.error("Error Verifying User:", error);
    return Response.json(
      {
        success: false,
        message: "Error Verifying User",
      },
      { status: 500 }
    );
    }
}