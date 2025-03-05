// Utility functions for generating cartoon content
const generateCartoonText = async (theme, style) => {
    try {
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a creative cartoon writer. Create an engaging, short (150 words max) cartoon scenario description based on the user's theme and style. The description should be suitable for image generation.

The output should follow this JSON schema, and no other text:
{
  "title": "A catchy title for the cartoon",
  "description": "A detailed description of the cartoon scene, characters, and setting",
  "prompt": "A refined prompt that will generate a good cartoon image based on the description"
}`
                },
                {
                    role: "user",
                    content: `Generate a cartoon scenario with theme: "${theme}" and style: "${style}"`
                }
            ],
            json: true
        });

        return JSON.parse(completion.content);
    } catch (error) {
        console.error("Error generating cartoon text:", error);
        throw new Error("Failed to generate cartoon text. Please try again later.");
    }
};

const generateCartoonImage = async (prompt, style) => {
    try {
        const stylePrompt = style ? `in ${style} style` : '';
        const enhancedPrompt = `A cartoon illustration ${stylePrompt} of: ${prompt}. Vibrant colors, cartoonish style, fun and engaging scene.`;
        
        const result = await websim.imageGen({
            prompt: enhancedPrompt,
            aspect_ratio: "16:9",
        });

        return result.url;
    } catch (error) {
        console.error("Error generating cartoon image:", error);
        throw new Error("Failed to generate cartoon image. Please try again later.");
    }
};

