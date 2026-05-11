from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'chat_link', 'available', 'created')
    list_filter = ('available', 'created', 'chat__project__user')
    search_fields = ('title', 'chat__name', 'chat__project__title')
    raw_id_fields = ('chat',)
    readonly_fields = ('created',)
    list_select_related = ('chat', 'chat__project')
    fieldsets = (
        (None, {'fields': ('chat', 'title', 'available', 'tracker_task_id')}),
        ('Даты', {'fields': ('created',), 'classes': ('collapse',)}),
    )

    def chat_link(self, obj):
        """Ссылка на страницу чата в админке"""
        if obj.chat:
            url = reverse('admin:chat_chat_change', args=[obj.chat.id])
            return format_html('<a href="{}">{}</a>', url, str(obj.chat))
        return '-'
    chat_link.short_description = 'Чат'