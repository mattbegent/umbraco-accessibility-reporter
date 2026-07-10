using System.Linq.Expressions;
using System.Reflection;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Extensions;

namespace AccessibilityReporter.Services
{
	// IPublishedContent.Name is a property in Umbraco 17 but was removed in Umbraco 18 in favour of
	// the PublishedContentExtensions.Name() extension method, whose receiver type also changed from
	// IPublishedContent to IPublishedElement. A single compiled assembly cannot bind to either shape
	// directly and still load on the other major, so the extension method (which exists in both
	// versions with the same name, declaring type and parameter count) is bound at runtime instead.
	internal static class PublishedContentNameResolver
	{
		private static readonly Lazy<Func<IPublishedContent, IVariationContextAccessor?, string?, string>> NameGetter = new(Build);

		public static string GetName(IPublishedContent content, IVariationContextAccessor? variationContextAccessor, string? culture)
			=> NameGetter.Value(content, variationContextAccessor, culture);

		private static Func<IPublishedContent, IVariationContextAccessor?, string?, string> Build()
		{
			MethodInfo method = typeof(PublishedContentExtensions)
				.GetMethods(BindingFlags.Public | BindingFlags.Static)
				.First(m => m.Name == "Name" && m.GetParameters().Length == 3);

			ParameterExpression content = Expression.Parameter(typeof(IPublishedContent), "content");
			ParameterExpression accessor = Expression.Parameter(typeof(IVariationContextAccessor), "accessor");
			ParameterExpression culture = Expression.Parameter(typeof(string), "culture");

			return Expression.Lambda<Func<IPublishedContent, IVariationContextAccessor?, string?, string>>(
				Expression.Call(
					method,
					Expression.Convert(content, method.GetParameters()[0].ParameterType),
					accessor,
					culture),
				content, accessor, culture).Compile();
		}
	}
}
