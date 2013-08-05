package org.qburst.search.services;

import java.util.HashMap;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.apache.solr.common.SolrDocumentList;
import org.qburst.search.model.Authentication;

public interface ISolrUtils {
	public QueryResponse  queryBooks(String q) throws Exception;
	public void writeBookMeta(Authentication user, String url) throws Exception;
	public HashMap<String, String> getUserInfo(String url) throws Exception;
	public String getBookFolder();
	public SolrDocumentList queryUserBooks(Authentication user) throws Exception;
}
