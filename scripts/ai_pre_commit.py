#!/usr/bin/env python3
import sys
import subprocess
import os

# Make sure we can import from src if needed, though this is lightweight
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from dotenv import load_dotenv

# Try to load env dynamically
try:
    import openai
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("⏭️  Skipping AI review: OPENAI_API_KEY not found in .env")
        sys.exit(0)
    client = openai.OpenAI(api_key=api_key)
except ImportError:
    print("⏭️  Skipping AI review: openai library not found. Run `uv sync`.")
    sys.exit(0)

print("🤖 Running Local AI Code Review...")

# 1. Get the staged diffs
result = subprocess.run(["git", "diff", "--cached"], capture_output=True, text=True)
diff_text = result.stdout.strip()

if not diff_text:
    print("No staged changes to review.")
    sys.exit(0)

# If the diff is huge (e.g. package-lock.json), skip it to save tokens
if len(diff_text) > 20000:
    print("⏭️  Skipping AI review: Diff is too large (>20,000 chars)")
    sys.exit(0)

# 2. Ask Gemini to review the code
prompt = f"""
You are an expert Senior Staff Software Engineer reviewing a Git commit.
Review the following split git diff.

Identify ANY of the following:
1. Security vulnerabilities (especially secrets/API keys left in code).
2. Obvious bugs, syntax errors, or logic errors.
3. Severe performance bottlenecks.

If the code looks good and has no critical issues, ONLY output "PASS".
If there are critical issues that should block this commit, output "FAIL" followed by a concise bulleted list explaining why.

Git Diff:
```diff
{diff_text}
```
"""

try:
    response = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[{"role": "user", "content": prompt}]
    )
    feedback = response.choices[0].message.content.strip()
    
    if feedback.startswith("PASS"):
        print("✅ AI Review Passed: No critical issues found.")
        sys.exit(0)
    else:
        print("\n❌ AI Review Failed:")
        print("====================")
        print(feedback)
        print("====================")
        print("\nIf you want to bypass this review, use: git commit --no-verify\n")
        sys.exit(1) # Block the commit
        
except Exception as e:
    print(f"⚠️  AI Review Error (skipping): {e}")
    sys.exit(0)
