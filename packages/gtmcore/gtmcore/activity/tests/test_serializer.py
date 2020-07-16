import pytest
from gtmcore.activity.serializers import Serializer
from gtmcore.activity.serializers.text import PlainSerializer


class TestSerializer(object):

    def test_constructor(self):
        """Test the constructor"""
        s = Serializer()

        assert type(s) == Serializer
        assert type(s.serializers['text/plain']) == PlainSerializer

    def test_bad_mime_type(self):
        """Test the constructor"""
        s = Serializer()

        with pytest.raises(ValueError):
            s.serialize('text/asdfasdfasdfasdf', 'asdfasdfasd')

    def test_text_plain(self):
        """Test the text/plain serializer"""
        s = Serializer()

        start_text = "This is a \n\n string with some \r stuff in it23894590*AS^&90R32UXZ02.66"

        test_bytes = s.serialize('text/plain', start_text)
        assert type(test_bytes) == bytes

        test_str = s.deserialize('text/plain', test_bytes)

        assert start_text == test_str
        assert type(test_str) == str

        test_str_2 = s.jsonify('text/plain', start_text)

        assert start_text == test_str_2
        assert type(test_str_2) == str

    def test_image_base64_png(self):
        """Test the image base64 serializers - png"""
        s = Serializer()

        example_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5/hPwAIAgL/4d1j8wAAAABJRU5ErkJggg=="

        test_bytes = s.serialize('image/png', example_png)
        assert type(test_bytes) == bytes

        test_str = s.deserialize('image/png', test_bytes)
        assert type(test_str) == str

    def test_image_jsonify_legacy(self):
        s = Serializer()

        example_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5/hPwAIAgL/4d1j8wAAAABJRU5ErkJggg=="
        test_str_2 = s.jsonify('image/png', example_png)

        assert test_str_2 == f"data:image/png;base64,{example_png}"

    def test_image_jsonify_not_legacy(self):
        s = Serializer()

        example_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5/hPwAIAgL/4d1j8wAAAABJRU5ErkJggg=="

        test_bytes = s.serialize('image/png', example_png)
        assert type(test_bytes) == bytes

        test_str = s.deserialize('image/png', test_bytes)

        test_str_2 = s.jsonify('image/png', test_str)
        assert test_str_2 == f"data:image/jpeg;base64,{test_str}"
