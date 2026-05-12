from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import EmailVerificationCode, UserProfile


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'expires_at', 'is_used')
    list_filter = ('is_used',)
    search_fields = ('user__email', 'code')
    readonly_fields = ('code', 'created_at', 'expires_at')


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'YouGile профиль'
    fields = ('has_yougile_key',)
    readonly_fields = ('has_yougile_key',)

    def has_yougile_key(self, obj):
        return bool(obj.yougile_api_key)
    has_yougile_key.boolean = True
    has_yougile_key.short_description = 'YouGile подключён'


class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]
    # Опционально: добавить колонку в список пользователей
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'has_yougile_key')

    def has_yougile_key(self, obj):
        if hasattr(obj, 'profile'):
            return bool(obj.profile.yougile_api_key)
        return False

    has_yougile_key.boolean = True
    has_yougile_key.short_description = 'YouGile'

    # Убедимся, что при создании пользователя создаётся и профиль
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not hasattr(obj, 'profile'):
            UserProfile.objects.create(user=obj)


# Перерегистрируем модель User
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
