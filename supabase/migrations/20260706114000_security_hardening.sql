/* Historical full-backend migration superseded by reset_create_mvp.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_auth_user_created() from public, anon, authenticated;
revoke execute on function public.handle_auth_user_updated() from public, anon, authenticated;
revoke execute on function public.prepare_enrollment() from public, anon, authenticated;
revoke execute on function public.protect_self_service_fields() from public, anon, authenticated;

revoke execute on function public.has_role(public.app_role) from public, anon;
revoke execute on function public.is_company_member(uuid) from public, anon;
revoke execute on function public.is_company_manager(uuid) from public, anon;
revoke execute on function public.is_session_trainer(uuid) from public, anon;
revoke execute on function public.can_access_student(uuid) from public, anon;
revoke execute on function public.can_access_student_private(uuid) from public, anon;
revoke execute on function public.can_access_enrollment(uuid) from public, anon;

grant execute on function public.has_role(public.app_role) to authenticated;
grant execute on function public.is_company_member(uuid) to authenticated;
grant execute on function public.is_company_manager(uuid) to authenticated;
grant execute on function public.is_session_trainer(uuid) to authenticated;
grant execute on function public.can_access_student(uuid) to authenticated;
grant execute on function public.can_access_student_private(uuid) to authenticated;
grant execute on function public.can_access_enrollment(uuid) to authenticated;

revoke execute on function public.verify_certificate(uuid, text) from public;
grant execute on function public.verify_certificate(uuid, text) to anon, authenticated;
*/
