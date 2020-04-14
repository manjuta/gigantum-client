def ask_question(question: str) -> bool:
    """Method to ask the user a yes/no question

    Args:
        question(str): A question to ask the user

    Returns:
        bool: True if yes, False if no
    """
    valid_response = {"yes": True, "y": True, "no": False, "n": False}

    while True:
        print("{} [y/n]: ".format(question), end="")
        choice = input().lower().strip()
        if choice in valid_response:
            return valid_response[choice]
        else:
            print("Please respond with 'yes' or 'no' (or 'y' or 'n').\n")
