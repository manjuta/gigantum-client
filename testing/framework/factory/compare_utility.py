class CompareUtility(object):
    """Compares the text with the passed argument"""
    def compare_text(self, *args):
        return self.get_text() == args[0]