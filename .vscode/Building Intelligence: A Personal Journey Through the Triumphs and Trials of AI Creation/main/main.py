import os
import json

# Define a dictionary to store file access counts
file_access_counts = {}

def track_file_access(file_path):
    """
    Track the number of times a file is accessed by logging the access count.
    """
    # Extract file name and location
    file_name = os.path.basename(file_path)
    file_location = os.path.dirname(file_path)
    
    # Update the access count in the dictionary
    if file_path not in file_access_counts:
        file_access_counts[file_path] = {
            'file_name': file_name,
            'file_location': file_location,
            'access_count': 0
        }

    # Increment access count
    file_access_counts[file_path]['access_count'] += 1

    # Log this access in a file (or do something else with it)
    with open('file_access_log.json', 'w') as log_file:
        json.dump(file_access_counts, log_file, indent=4)

def open_file(file_path):
    """
    Open a file and track its access.
    """
    try:
        # Track access
        track_file_access(file_path)
        
        # Open the file with a safe encoding and handle errors
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
            content = file.read()  # Or whatever operation you need
            return content
    except Exception as e:
        print(f"Error accessing the file: {e}")

def scan_directory(directory_path):
    """
    Recursively scan the given directory and track all file accesses.
    """
    for root, dirs, files in os.walk(directory_path):
        for file_name in files:
            file_path = os.path.join(root, file_name)
            # Track access for every file found
            open_file(file_path)

# Example usage:
directory_path = '/home'  # Replace with the path of the directory you want to scan
scan_directory(directory_path)
