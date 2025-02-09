import json
import numpy as np
import sys
import subprocess
import os


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

def callAssignmentMiner(repo_url):
    
    repository_path = "./"+repo_url+"/.git"
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
    
    repository_path = "./"+repo_url+"/.git"
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
    
    repository_path = "./"+repo_url+"/.git"
    command = ["./run.sh", "ChangedFilesMiner", "--repository", repository_path, "master"]
        
    try:
        # Run the command using subprocess.run with check=True
        subprocess.run(command, check=True)

        # Print a success message
        print(f"ChangedFilesMiner successful.")

    except subprocess.CalledProcessError as e:
        # Print an error message if the command fails
        print(f"Error occurred while running ChangedFilesMiner: {e}")



print("starting")

if len(sys.argv) != 2:
    print("Usage: python3 calculator.py <input>")
    sys.exit(1)

# Get the input argument
repo_name = sys.argv[1]
os.chdir('tnm-main')
callAssignmentMiner(repo_name)
callChangedFilesMiner(repo_name)
callFileDependencyMatrixMiner(repo_name)
os.chdir('..')

#
# changing all values of matrices to 1 if val > 0 because it was weighted previously
#

# load AssignmentMatrix
file_path = 'tnm-main/result/AssignmentMatrix'

with open(file_path, 'r') as file:
    parsed_data = json.load(file) 

#change to 1s
result1 = parsed_data



#load FileDependencyMatrix
file_path = 'tnm-main/result/FileDependencyMatrix'

with open(file_path, 'r') as file:
    parsed_data = json.load(file) 

#change to 1s
result2 = parsed_data


#load ChangedFilesByUser
file_path = 'tnm-main/result/ChangedFilesByUser'

with open(file_path, 'r') as file:
    parsed_data = json.load(file) 

#change to 1s
result3 = parsed_data

save_to_file(result1, 'cache/AssignmentMatrix.json')
save_to_file(result2, 'cache/FileDependencyMatrix.json')
save_to_file(result3, 'cache/ChangedFilesByUser.json')




#
# Making Cr
#

#get user count
users = 'tnm-main/result/idToUser'

with open(file_path, 'r') as file:
    users = json.load(file) 

#get file count
file_path = 'tnm-main/result/idToFile'

with open(file_path, 'r') as file:
    files = json.load(file) 



usercount = largest_parent_key(users)
filecount = largest_parent_key(files)

#Making TA
assignmentMatrix = np.zeros((usercount+1, filecount+1),dtype=int)

for parent_key, inner_dict in result1.items():
    for inner_key in inner_dict.keys():
        assignmentMatrix[int(parent_key)][int(inner_key)] = 1



#Making TD
fileDependencyMatrix = np.zeros((filecount+1, filecount+1),dtype=int)

for parent_key, inner_dict in result2.items():
    for inner_key in inner_dict.keys():
        fileDependencyMatrix[int(parent_key)][int(inner_key)] = 1


#calculating (Ta*Td) * Ta^transposed
TAmultTD = np.dot(assignmentMatrix, fileDependencyMatrix)

assignmentMatrix_T = np.transpose(assignmentMatrix)

coordinationReqMatrix = np.dot(TAmultTD,assignmentMatrix_T)

#reset all content to 1
#coordinationReqMatrix[coordinationReqMatrix != 0] = 1

multiClassCoordinationReqMatrix = coordinationReqMatrix.copy()

security_class = [1, 3, 54, 69, 102, 103, 122, 125, 136, 138, 144, 185]
security_class.sort()
dev_class = [num for num in range(usercount+1) if num not in security_class]



for i in security_class:
    for j in security_class:
            multiClassCoordinationReqMatrix[i][j] = 0

for i in dev_class:
    for j in dev_class:
            multiClassCoordinationReqMatrix[i][j] = 0


# Create a dictionary with row index as the parent key
json_dict = {str(index): row.tolist() for index, row in enumerate(coordinationReqMatrix)}

# saving Cr as json 
save_to_file(json_dict, "cache/coordinationRequiredMatrix.json")

# Create a dictionary with row index as the parent key
json_dict = {str(index): row.tolist() for index, row in enumerate(multiClassCoordinationReqMatrix)}

# saving Cr as json 
save_to_file(json_dict, "cache/multiClassCoordinationReqMatrix.json")


#
# Making Ca
#

CoordinationActualMatrix = np.zeros((usercount+1, usercount+1),dtype=int)

user_ids = list(result3.keys())  # Get the user ids as a list (like ["0", "1", "2"])

for i in range(usercount+1):
    for j in range(usercount+1):
        user1 = user_ids[i]
        user2 = user_ids[j]
        
        # Find if they accessed the same files
        common_files = set(result3[user1]).intersection(set(result3[user2]))
        
        # If they accessed common files, set matrix[user1][user2] = 1
        if common_files and i!=j:
            CoordinationActualMatrix[i][j] = 1

multiClassCoordinationActualMatrix = CoordinationActualMatrix.copy()

for i in security_class:
    for j in security_class:
        if multiClassCoordinationActualMatrix[i][j] != 0:
            multiClassCoordinationActualMatrix[i][j] = 0

for i in dev_class:
    for j in dev_class:
        if multiClassCoordinationActualMatrix[i][j] != 0:
            multiClassCoordinationActualMatrix[i][j] = 0



# Create a dictionary with row index as the parent key
json_dict = {str(index): row.tolist() for index, row in enumerate(CoordinationActualMatrix)}

# saving Ca as json 
save_to_file(json_dict, "cache/coordinationActualMatrix.json")


# Create a dictionary with row index as the parent key
json_dict = {str(index): row.tolist() for index, row in enumerate(multiClassCoordinationActualMatrix)}

# saving (MC)2C-Ca as json 
save_to_file(json_dict, "cache/multiClassCoordinationActualMatrix.json")


#
# STC CALCULATION
#




Diff = 0
Cr = 0
for i in range(usercount+1):
    for j in range(usercount+1):
        # Count actual coordination only where required coordination exists
        if coordinationReqMatrix[i][j] !=0 and CoordinationActualMatrix[i][j] !=0 and i!=j:
            Diff += 1
        if coordinationReqMatrix[i][j] != 0 and i!=j:
            Cr += 1
MCDiff = 0
MCCR = 0
for i in range(usercount+1):
    for j in range(usercount+1):
        # Count actual coordination only where required coordination exists
        if multiClassCoordinationReqMatrix[i][j] !=0 and multiClassCoordinationActualMatrix[i][j] !=0 and i!=j:
            MCDiff += 1
        if multiClassCoordinationReqMatrix[i][j] != 0 and i!=j:
            MCCR += 1

STC = Diff / Cr
with open("cache/stc-"+repo_name, 'w') as file:
    file.write(str(STC))

MCSTC = MCDiff / MCCR
with open("cache/mc-stc-"+repo_name, 'w') as file:
    file.write(str(MCSTC))




#
# Making Node[] and Links[] for D3JS
#

Requirements = {
    "nodes": [],
    "links": []
}

Actual = {
    "nodes": [],
    "links": []
}

#Nodes creation
file_path = 'tnm-main/result/idToUser'

with open(file_path, 'r') as file:
    userfile = json.load(file) 

for key in userfile:
    group = "developer"
    for member in security_class:
        if int(key) == member:
            group = "security"
            break
    Requirements["nodes"].append({"id":userfile[key], "group": group})
    Actual["nodes"].append({"id":userfile[key], "group": group})


#Link creation for Requirements
for row in range(multiClassCoordinationReqMatrix.shape[0]):  # Loop through rows
    for col in range(multiClassCoordinationReqMatrix.shape[1]):  # Loop through columns
        if multiClassCoordinationReqMatrix[row, col] != 0:
            Requirements["links"].append({"source":userfile[str(row)], "target": userfile[str(col)]})

save_to_file(Requirements, "cache/MC-Requirements-Graph-"+repo_name+".json")

#Link creation for Actual
for row in range(multiClassCoordinationActualMatrix.shape[0]):  # Loop through rows
    for col in range(multiClassCoordinationActualMatrix.shape[1]):  # Loop through columns
        if multiClassCoordinationActualMatrix[row, col] != 0:
            Actual["links"].append({"source":userfile[str(row)], "target": userfile[str(col)], "value": 1})

save_to_file(Actual, "cache/MC-Actual-Graph-"+repo_name+".json")