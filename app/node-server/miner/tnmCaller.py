import os
import shutil
import subprocess
import json
import sys
import numpy as np

def get_repo_name(repo_url):
    """Extract the repository name from the .git URL."""
    return repo_url.rstrip('/').split('/')[-1].replace('.git', '')

def clone_or_replace_repo(repo_url):
    # Extract the repository name from the URL
    repo_name = get_repo_name(repo_url)
    print("cloning repository: " + repo_name + "\n")

    
    if os.path.exists(repo_name):
        print(f"Directory '{repo_name}' already exists. Removing it...")
        shutil.rmtree(repo_name)  # Remove the directory and its contents

    # Clone the repository into the specified subdirectory inside 'tnm-main'
    print(f"Cloning the repository into tnm-main/"+repo_name+"/"+"...\n")
    try:
        subprocess.run(['git', 'clone', repo_url], check=True)
        print(f"Successfully cloned the repository into tmm-main/"+repo_name+"/"+"...\n")
    except subprocess.CalledProcessError as e:
        print(f"An error occurred while cloning the repository: {e}")
        return False

    return True

def callAssignmentMiner(repo_url):
    
    repository_path = "./"+get_repo_name(repo_url)+"/.git"
    command = ["./run.sh", "AssignmentMatrixMiner", "--repository", repository_path, "master"]
        
    try:
        # Run the command using subprocess.run with check=True
        subprocess.run(command, check=True)

        # Print a success message
        print(f"AssignmentMatrixMiner successful.")

    except subprocess.CalledProcessError as e:
        # Print an error message if the command fails
        print(f"Error occurred while running AssignmentMatrixMiner: {e}")

def callFileDependencyMatrixMiner(repo_url):
    
    repository_path = "./"+get_repo_name(repo_url)+"/.git"
    command = ["./run.sh", "FileDependencyMatrixMiner", "--repository", repository_path, "master"]
        
    try:
        # Run the command using subprocess.run with check=True
        subprocess.run(command, check=True)

        # Print a success message
        print(f"FileDependencyMatrixMiner successful.")

    except subprocess.CalledProcessError as e:
        # Print an error message if the command fails
        print(f"Error occurred while running FileDependencyMatrixMiner: {e}")

def callChangedFilesMiner(repo_url):
    
    repository_path = "./"+get_repo_name(repo_url)+"/.git"
    command = ["./run.sh", "ChangedFilesMiner", "--repository", repository_path, "master"]
        
    try:
        # Run the command using subprocess.run with check=True
        subprocess.run(command, check=True)

        # Print a success message
        print(f"ChangedFilesMiner successful.")

    except subprocess.CalledProcessError as e:
        # Print an error message if the command fails
        print(f"Error occurred while running ChangedFilesMiner: {e}")

def change_all_values_to_one(parsed_data):
    for outer_key in parsed_data:
        for inner_key in parsed_data[outer_key]:
            parsed_data[outer_key][inner_key] = 1
    return parsed_data


def save_to_file(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)

def largest_parent_key(data):
    return max(int(key) for key in data.keys())        

# Main
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 script.py <github link>")
        sys.exit(1)

# Get the input argument
    repo_url = sys.argv[1]

    os.chdir('/app/app/node-server/miner/tnm-main')
    success = clone_or_replace_repo(repo_url)
    if success:
        print("Operation completed successfully.")
    else:
        print("Operation failed.")
    callAssignmentMiner(repo_url)
    callFileDependencyMatrixMiner(repo_url)
    callChangedFilesMiner(repo_url)
    os.chdir('/app/app/node-server/miner')
    subprocess.run(["python3", "calculator.py", get_repo_name(repo_url)])
