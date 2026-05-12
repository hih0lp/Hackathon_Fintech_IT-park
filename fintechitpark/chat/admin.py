from django.contrib import admin
from .models import Chat, Message


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ('id', 'project', 'name', 'available', 'created')
    list_filter = ('project',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'chat', 'sender', 'text_preview', 'created_at')
    list_filter = ('sender',)

    def text_preview(self, obj):
        return obj.text[:50]
