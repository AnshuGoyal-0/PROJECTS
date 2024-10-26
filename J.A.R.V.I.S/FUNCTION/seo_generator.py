def seo_gen():
    import tkinter as tk
    from tkinter import scrolledtext
    from g4f.client import Client

    def llm2(text):
        client = Client()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": 'Seo Ai', "content": f"{text}"}]
        )

        x = response.choices[0].message.content
        return x

    def generate_title_and_description():
        loading_label.config(text="Generating...", fg="blue")
        root.update()

        topic = topic_entry.get()

        # Generate Title
        title_text = f"write a best seo based youtube title as you know the title is under in word limit is 50 words and my topic is " + topic
        title_result.set(llm2(title_text))

        # Generate Description
        description_text = f"write a best seo based youtube description format is 100 keywords based on topic {topic} , arrange it using comma ,10 top seo based hashtags based on topic {topic}, the length of the video is as you know the title is under in word limit is 3000 words and my topic is the video about"
        description_result.set(llm2(description_text))

        # Generate Additional Tags
        tags_text = llm2(
            f"generate 50 keywords based on topic {topic} , arrange it using comma, dont use numbers and count just format it like , tag,tag,tag,tag,tag,... so on")
        tags_result.set(tags_text)

        loading_label.config(text="")
        root.update()

    # Tkinter setup
    root = tk.Tk()
    root.title("SEO Title and Description Generator")
    root.geometry("800x800")  # Increased height to accommodate additional tags
    root.configure(bg="#282c34")  # Dark background color

    # Topic Entry
    topic_label = tk.Label(root, text="Enter the topic:", fg="white", bg="#282c34", font=("Helvetica", 12))
    topic_label.pack()

    topic_entry = tk.Entry(root, bg="#D3D3D3")
    topic_entry.pack()

    # Generate Button
    generate_button = tk.Button(root, text="Generate", command=generate_title_and_description, bg="#61dafb",
                                fg="white", font=("Helvetica", 12))
    generate_button.pack()

    # Result Labels
    loading_label = tk.Label(root, text="", fg="blue", bg="#282c34", font=("Helvetica", 12, "italic"))
    loading_label.pack()

    # Generated Title
    title_result = tk.StringVar()
    title_label = tk.Label(root, text="Generated Title:", font=("Helvetica", 12, "bold"), fg="white", bg="#282c34")
    title_label.pack()

    title_output = scrolledtext.ScrolledText(root, width=80, height=7, wrap=tk.WORD, bg="#D3D3D3", fg="#282c34")
    title_output.pack()

    # Generated Description
    description_result = tk.StringVar()
    description_label = tk.Label(root, text="Generated Description:", font=("Helvetica", 12, "bold"), fg="white",
                                 bg="#282c34")
    description_label.pack()

    description_output = scrolledtext.ScrolledText(root, width=80, height=10, wrap=tk.WORD, bg="#D3D3D3", fg="#282c34")
    description_output.pack()

    # Generated Additional Tags
    tags_result = tk.StringVar()
    tags_label = tk.Label(root, text="Generated Tags:", font=("Helvetica", 12, "bold"), fg="white", bg="#282c34")
    tags_label.pack()

    tags_output = scrolledtext.ScrolledText(root, width=80, height=5, wrap=tk.WORD, bg="#D3D3D3", fg="#282c34")
    tags_output.pack()

    # Function to periodically check for completion and update outputs
    def check_completion():
        if loading_label.cget("text") == "Generating...":
            root.after(100, check_completion)
        else:
            update_outputs()

    # Function to update output boxes
    def update_outputs():
        title_output.delete(1.0, tk.END)
        title_output.insert(tk.END, title_result.get())

        description_output.delete(1.0, tk.END)
        description_output.insert(tk.END, description_result.get())

        tags_output.delete(1.0, tk.END)
        tags_output.insert(tk.END, tags_result.get())

    # Set the update function to be called whenever the button is pressed
    generate_button.config(command=lambda: (generate_title_and_description(), check_completion()))

    # Run Tkinter event loop
    root.mainloop()

