def generate_recommendations(input_dict: dict) -> list:
    recs = []

    if input_dict["communication_skill"] < 6:
        recs.append("Your communication score is low — practice mock interviews and group discussions daily.")

    if input_dict["dsa_rating"] < 1200:
        recs.append("Boost your DSA rating by solving problems consistently on LeetCode / Codeforces.")

    if input_dict["projects_completed"] < 2:
        recs.append("Build 2-3 more portfolio projects that solve a real problem end-to-end.")

    if input_dict["resume_score"] < 60:
        recs.append("Your resume score is low — rewrite bullets with action-method-outcome structure and run it through an ATS checker.")

    if input_dict["internships"] == 0:
        recs.append("You have no internships listed — apply on Internshala, LinkedIn, and Unstop for relevant roles.")

    if input_dict["backlogs"] > 0:
        recs.append("Clear pending backlogs as a priority — many recruiters filter candidates by backlog count.")

    if input_dict["certifications"] < 2:
        recs.append("Add 1-2 relevant certifications (e.g. AWS, Google, or domain-specific) to strengthen your profile.")

    if input_dict["github_activity_score"] < 40:
        recs.append("Increase your GitHub activity — regular commits and pinned projects signal real coding practice.")

    if input_dict["linkedin_active"] == 0:
        recs.append("Activate your LinkedIn profile and post about your projects to build visibility with recruiters.")

    if not recs:
        recs.append("Your profile looks strong across all tracked factors — keep up the consistency.")

    return recs
