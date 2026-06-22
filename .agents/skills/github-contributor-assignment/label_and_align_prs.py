import json
import subprocess
import re
import sys
import os

# Reconfigure stdout/stderr for UTF-8
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Core active repositories in the spine
repos = ["Context", "Website", "Access", "Memory", "Contracts", "SDK", "Notebook", "Fitent", ".github"]

# Exact allowed case-sensitive labels
ALLOWED_DIFFICULTIES = ["Easy", "Medium", "Hard"]
CORRECT_LABELS = {
    "easy": "Easy", "medium": "Medium", "hard": "Hard",
    "ssoc26": "SSoC26"
}
LABEL_COLORS = {
    "SSoC26": "ededed",
    "Easy": "008672",
    "Medium": "d1b100",
    "Hard": "e11d21"
}

print("=== STARTING PR AND ISSUE LABEL ALIGNMENT ROUTINE ===")

def fix_label_typos(repo, item_num, current_labels, item_type="issue"):
    """
    Checks for typos (wrong casing) in current labels, removes incorrect ones, 
    and applies correct title-cased labels.
    """
    labels_to_remove = []
    labels_to_add = []
    
    for lbl in current_labels:
        lbl_lower = lbl.lower()
        if lbl_lower in CORRECT_LABELS:
            correct_name = CORRECT_LABELS[lbl_lower]
            if lbl != correct_name:
                labels_to_remove.append(lbl)
                labels_to_add.append(correct_name)
    
    # Remove wrong labels
    for lbl in labels_to_remove:
        print(f"  -> Typos detected in {item_type} #{item_num}: '{lbl}' should be '{CORRECT_LABELS[lbl.lower()]}'")
        cmd_remove = f'gh {item_type} edit {item_num} -R Memact/{repo} --remove-label "{lbl}"'
        subprocess.run(cmd_remove, shell=True, capture_output=True)
        
    # Add corrected labels
    if labels_to_add:
        # Preemptively create correct labels if they don't exist
        for lbl in labels_to_add:
            col = LABEL_COLORS.get(lbl, "ededed")
            subprocess.run(f'gh label create "{lbl}" -R Memact/{repo} --color "{col}"', shell=True, capture_output=True)
            
        label_str = ",".join(labels_to_add)
        cmd_add = f'gh {item_type} edit {item_num} -R Memact/{repo} --add-label "{label_str}"'
        res_add = subprocess.run(cmd_add, shell=True, capture_output=True, text=True, encoding='utf-8')
        if res_add.returncode == 0:
            print(f"  -> Typo labels corrected on {item_type} #{item_num}: {label_str}")
        else:
            print(f"  -> Failed to correct labels: {res_add.stderr.strip()}")

for repo in repos:
    try:
        print(f"\nProcessing Memact/{repo}...")
        
        # 1. Fetch all open issues in the repo
        cmd_issues = f'gh issue list -R Memact/{repo} --state open --limit 100 --json number,title,labels'
        res_issues = subprocess.run(cmd_issues, shell=True, capture_output=True, text=True, encoding='utf-8')
        issues_dict = {}
        if res_issues.returncode == 0 and res_issues.stdout:
            issues = json.loads(res_issues.stdout)
            for issue in issues:
                num = issue["number"]
                labels = [l["name"] for l in issue.get("labels", [])]
                issues_dict[num] = labels
                # Check for typos on issue labels
                fix_label_typos(repo, num, labels, item_type="issue")
        
        # 2. Fetch all open PRs in the repo
        cmd_prs = f'gh pr list -R Memact/{repo} --state open --limit 100 --json number,title,body,labels'
        res_prs = subprocess.run(cmd_prs, shell=True, capture_output=True, text=True, encoding='utf-8')
        if res_prs.returncode == 0 and res_prs.stdout:
            prs = json.loads(res_prs.stdout)
            for pr in prs:
                pr_num = pr["number"]
                pr_title = pr["title"]
                pr_body = pr.get("body", "") or ""
                pr_labels = [l["name"] for l in pr.get("labels", [])]
                
                print(f"  Evaluating PR #{pr_num}: '{pr_title}'")
                
                # Check for typos on current PR labels
                fix_label_typos(repo, pr_num, pr_labels, item_type="pr")
                
                # Parse references to issues in the PR body or title
                # Look for formats like: #52, closes #52, fixes #52, resolve #52, etc.
                combined_text = f"{pr_title} \n {pr_body}"
                issue_refs = re.findall(r'(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)?\s*#(\d+)', combined_text, re.IGNORECASE)
                # Deduplicate and convert to integers
                referenced_issues = list(set(int(num) for num in issue_refs))
                
                if referenced_issues:
                    print(f"    Linked issue references found: {referenced_issues}")
                    
                    # Gather labels from linked issues
                    linked_labels = []
                    for issue_num in referenced_issues:
                        if issue_num in issues_dict:
                            linked_labels.extend(issues_dict[issue_num])
                        else:
                            # If the issue is closed or not in open list, fetch its details directly
                            cmd_view = f'gh issue view {issue_num} -R Memact/{repo} --json labels'
                            res_view = subprocess.run(cmd_view, shell=True, capture_output=True, text=True, encoding='utf-8')
                            if res_view.returncode == 0 and res_view.stdout:
                                view_data = json.loads(res_view.stdout)
                                linked_labels.extend([l["name"] for l in view_data.get("labels", [])])
                    
                    # Extract difficulty labels and SSoC26 tags
                    labels_to_apply = []
                    for lbl in linked_labels:
                        lbl_lower = lbl.lower()
                        if lbl_lower == "ssoc26" and "SSoC26" not in pr_labels:
                            labels_to_apply.append("SSoC26")
                        elif lbl in ALLOWED_DIFFICULTIES and lbl not in pr_labels:
                            labels_to_apply.append(lbl)
                        elif lbl_lower in CORRECT_LABELS and CORRECT_LABELS[lbl_lower] not in pr_labels:
                            labels_to_apply.append(CORRECT_LABELS[lbl_lower])
                            
                    # Apply matching SSoC26 and difficulty labels to the PR
                    if labels_to_apply:
                        labels_to_apply = list(set(labels_to_apply))
                        
                        # Preemptively create correct labels if they don't exist on this repo
                        for lbl in labels_to_apply:
                            col = LABEL_COLORS.get(lbl, "ededed")
                            subprocess.run(f'gh label create "{lbl}" -R Memact/{repo} --color "{col}"', shell=True, capture_output=True)
                            
                        label_str = ",".join(labels_to_apply)
                        cmd_pr_label = f'gh pr edit {pr_num} -R Memact/{repo} --add-label "{label_str}"'
                        res_pr_label = subprocess.run(cmd_pr_label, shell=True, capture_output=True, text=True, encoding='utf-8')
                        
                        if res_pr_label.returncode == 0:
                            print(f"    [SUCCESS] Labeled PR #{pr_num} with: {label_str}")
                            # Post engagement comment
                            body_msg = f"**SSoC26 Labeling:** This Pull Request has been automatically linked to the corresponding issue labels: `{label_str}`! Thank you for contributing!"
                            cmd_comment = f'gh pr comment {pr_num} -R Memact/{repo} -b "{body_msg}"'
                            subprocess.run(cmd_comment, shell=True, capture_output=True)
                        else:
                            print(f"    [FAILED] Could not label PR #{pr_num}: {res_pr_label.stderr.strip()}")
                else:
                    # If no issues are linked, we still check if we can add SSoC26 if the PR title mentions it
                    if "ssoc" in pr_title.lower() and "SSoC26" not in pr_labels:
                        # Create label if missing
                        subprocess.run(f'gh label create "SSoC26" -R Memact/{repo} --color "ededed"', shell=True, capture_output=True)
                        cmd_pr_label = f'gh pr edit {pr_num} -R Memact/{repo} --add-label "SSoC26"'
                        subprocess.run(cmd_pr_label, shell=True, capture_output=True)
                        print(f"    [SUCCESS] Added SSoC26 label to PR #{pr_num} based on title reference.")
                        
    except Exception as e:
        print(f"Error checking Memact/{repo}: {e}")

print("\n=== LABEL ALIGNMENT ROUTINE COMPLETED ===")
