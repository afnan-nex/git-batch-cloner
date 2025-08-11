# **Git Batch Cloner**

A simple Python script to clone multiple GitHub repositories one by one from user input.

## **Features**

*   Clone GitHub repositories by entering their URLs.
*   Simple command-line interface.
*   Continues cloning until you exit with Ctrl+C.
*   Provides feedback on successful clones and invalid inputs.

## **Prerequisites**

*   Python 3.x
*   Git installed and accessible from the command line
*   Internet connection to access GitHub repositories

## **Installation**

Clone this repository:  
```
git clone https://github.com/afnan-nex/git-batch-cloner.git
```
Navigate to the project directory:  
```
cd git-batch-cloner
```
## **Usage**

Run the script:  
```
python git_batch_cloner.py
```
1.  Enter the GitHub repository URLs one by one when prompted.
2.  Press Ctrl+C to exit the script.

### **Example**
```
=== GitHub Repo Cloner ===

Enter repository URLs one by one.

Press Ctrl+C to exit.

Enter repo URL: https://github.com/example/repo.git

Cloning into 'repo'...

✅ Cloned: https://github.com/example/repo.git

--------------------------------------------------

Enter repo URL:

⚠️ No URL entered. Try again.

Enter repo URL: https://github.com/example/another-repo.git

Cloning into 'another-repo'...

✅ Cloned: https://github.com/example/another-repo.git

--------------------------------------------------

Ctrl + C

👋 Exiting... Goodbye!
```
## **License**

This project is licensed under the MIT License. See the [LICENSE](https://github.com/afnan-nex/git-batch-cloner/blob/main/LICENSE) file for details.
