# AI-Powered CV: Anonymization, Reformatting & Agentic AI

**Objective**  
Create a **Next.js** web application that:

1. **Parses and Anonymizes** a CV (removing personal data while retaining minimal essential info).
2. **Reformats** the CV into a consistent, user-friendly layout (with clear headings, bold text, etc.).
3. Displays the **updated CV** in a **rich text editor**, allowing the user to make final adjustments.
4. Incorporates a **required** agentic AI component—where you decide how an AI agent can further aid the CV process or potentially enhance the next step in the recruitment pipeline.

We’ll provide:

- **OpenAI API Key**.
- **Sample CV File**.
- A reference for **desired final CV styling** (headings, bold text, spacing).

---

## 1. Core Tasks

1. **CV Input**

   - Let the user upload a CV or select a provided sample.
   - How you parse the file and retrieve text is up to you.

2. **Anonymization**

   - Remove personally identifiable information, retaining only minimal details if needed (e.g., a first name).
   - Document any assumptions or prompts you use.

3. **Reformatting**

   - Organize the CV into a **consistent** layout—headings, bold text, bullet points—matching our provided sample-formatted-cv.pdf.

4. **User Review**

   - Show the updated CV in a **rich text editor**, so the user can adjust or finalize it before completion.

5. **Agentic AI**
   - Use a multi-step or “agent-like” approach in at least one aspect of this project—whether it’s during anonymization, reformatting, or another creative step in the recruitment pipeline.
   - We encourage you to **be inventive** about how an AI agent might assist or add value here.

---

## 2. Technical Guidelines

- **Framework**: Next.js (preferably using the App Router).
- **UI Library**: You may use [shadcn/ui](https://ui.shadcn.com/) for components.
- **Deployment**: We’ll review your **Vercel** deployment—please provide the live URL.
- **Testing**: Include at least some **unit tests** to demonstrate quality.

---

## 3. Submission Guidelines

1. **Repository & Code**

   - Fork or clone this repo (or create a private one and invite us).
   - Organize your code however you see fit.
   - When complete, either:
     - Share your forked repository URL with us
     - Submit a pull request to this repository
     - If using a private repository, invite us as collaborators

2. **Implementation**

   - Complete the tasks (anonymization, reformatting, rich text editing) while integrating at least one **agentic AI** step.
   - Document your approach in a readable file for review.

3. **Deployment**

   - Deploy to **Vercel** and share the link.
   - Ensure we can test the flow end to end (upload → anonymize → reformat → review → final).

4. **Testing & Documentation**
   - Provide a **quick start** guide for installing/running.
   - Show us how to run your tests.

---

## 4. Evaluation Criteria

1. **Functionality & Usability**: Does the CV anonymization and reformatting work? Is the editor intuitive?
2. **Agentic AI**: Have you implemented a multi-step or agent-like process in at least one stage?
3. **Code Quality & Organization**: Is the code maintainable, readable, and structured well?
4. **Testing & Documentation**: Do you have meaningful tests, and are setup/deployment instructions clear?
5. **Styling & UX**: Are headings, bold text, and layout consistent with the modern design principles?

---

## 5. Final Notes

- Feel free to **innovate**—whether you integrate AI for next-step recruitment tasks, sophisticated parsing, or additional features.
- If you have any questions or clarifications, reach out.
