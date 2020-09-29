class CompareUtility(object):
    """Compares the text with the passed argument"""
    def compare_text(self, *args):
        return self.get_text() == args[0]

    def check_element(self, *args):
        element = self.find_element_by_class_name(*args[0])
        if element:
            return True
        else:
            return False
