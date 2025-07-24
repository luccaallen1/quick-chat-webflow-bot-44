
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DemoRequest {
  name: string;
  company_name: string;
  purpose_of_chatbot: string;
  email: string;
  phone_number?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const demoData: DemoRequest = await req.json();
    console.log("Processing demo request for:", demoData.email);

    // Email to admin (Lucca@toratech.ai)
    const adminEmailResponse = await resend.emails.send({
      from: "AI Chatbot Widget <onboarding@resend.dev>",
      to: ["Lucca@toratech.ai"],
      subject: `New Demo Request from ${demoData.company_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">New Demo Request</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Contact Information</h3>
            <p><strong>Name:</strong> ${demoData.name}</p>
            <p><strong>Company:</strong> ${demoData.company_name}</p>
            <p><strong>Email:</strong> ${demoData.email}</p>
            ${demoData.phone_number ? `<p><strong>Phone:</strong> ${demoData.phone_number}</p>` : ''}
          </div>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0;">Chatbot Purpose</h3>
            <p>${demoData.purpose_of_chatbot}</p>
          </div>
          <p style="margin-top: 20px; color: #64748b;">
            <small>This request was submitted through the AI Chatbot Widget demo form.</small>
          </p>
        </div>
      `,
    });

    // Email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "AI Chatbot Widget <onboarding@resend.dev>",
      to: [demoData.email],
      subject: "Thank you for your demo request!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Thank you for your interest!</h2>
          <p>Hi ${demoData.name},</p>
          <p>Thank you for requesting a demo of our AI Chatbot Widget for <strong>${demoData.company_name}</strong>.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Request Details</h3>
            <p><strong>Purpose:</strong> ${demoData.purpose_of_chatbot}</p>
            <p><strong>Contact Email:</strong> ${demoData.email}</p>
            ${demoData.phone_number ? `<p><strong>Phone:</strong> ${demoData.phone_number}</p>` : ''}
          </div>
          
          <p>Our team will review your request and get back to you within <strong>24 hours</strong> to schedule your personalized demo.</p>
          
          <p>In the meantime, feel free to explore our website to learn more about our chatbot capabilities.</p>
          
          <p>Best regards,<br>
          The AI Chatbot Widget Team</p>
          
          <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
            <small>If you have any immediate questions, please don't hesitate to reach out to us directly.</small>
          </p>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);
    console.log("Customer email sent:", customerEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminEmailResponse, 
        customerEmail: customerEmailResponse 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-demo-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
