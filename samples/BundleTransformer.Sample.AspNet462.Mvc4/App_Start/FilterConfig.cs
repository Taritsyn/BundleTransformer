﻿using System.Web.Mvc;

namespace BundleTransformer.Sample.AspNet462.Mvc4
{
	public class FilterConfig
	{
		public static void RegisterGlobalFilters(GlobalFilterCollection filters)
		{
			filters.Add(new HandleErrorAttribute());
		}
	}
}