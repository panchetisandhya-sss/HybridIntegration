import sys

code = """
@app.get("/api/voter/candidates")
def get_voter_candidates(curr = Depends(get_current_voter)):
    try:
        constituency = curr["node"]["constituency"]
        conn = sqlite3.connect('quantum_voting.db')
        c = conn.cursor()
        
        # Fetch candidates for the specific constituency
        rows = c.execute("SELECT display_name, party_name FROM candidates WHERE constituency = ?", (constituency,)).fetchall()
        
        candidates = [f"{r[0]} — {r[1]}" for r in rows]
        conn.close()
        
        # If no candidates found for that specific string, return a default AP list
        if not candidates:
            candidates = ["TDP — Party Candidate", "YSRCP — Party Candidate", "JSP — Party Candidate", "BJP — Party Candidate"]
            
        return {"success": True, "constituency": constituency, "candidates": candidates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""

with open('main.py', 'a') as f:
    f.write('\n' + code)
print("Voter Candidate API appended.")
