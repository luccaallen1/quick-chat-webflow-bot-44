
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = "bark" } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const togetherApiKey = Deno.env.get('TOGETHER_AI_API_KEY');
    if (!togetherApiKey) {
      throw new Error('Together AI API key not configured');
    }

    console.log('Generating TTS for text:', text.substring(0, 50) + '...');

    // Call Together AI TTS API
    const response = await fetch('https://api.together.xyz/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: voice === "bark" ? "bark" : "tortoise-tts",
        input: text,
        voice: voice === "bark" ? "v2/en_speaker_6" : "pat2",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together AI API error:', errorText);
      throw new Error(`TTS API error: ${response.status}`);
    }

    // Get audio data as array buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for transmission
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    console.log('TTS generation successful, audio size:', audioBuffer.byteLength);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        contentType: 'audio/wav'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in together-tts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
