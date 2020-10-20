class CompareUtility(object):
    """Compares the text with the passed argument"""
    def compare_text(self, *args):
        return self.get_text() == args[0]

    def check_element(self, *args):
        """Check for an element by it's class name"""
        element = self.find_element_by_class_name(*args[0])
        if element:
            return True
        else:
            return False

    def check_contains_text(self, *args):
        """Check whether the text is present in the element"""
        return True if args[0] in self.get_text() else False
